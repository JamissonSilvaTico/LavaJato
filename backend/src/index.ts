import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db";
import { PoolClient } from "pg";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
};

// --- API Routes ---

// Customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await executeQuery(`
            SELECT c.*,
                   COALESCE(json_agg(v.*) FILTER (WHERE v.id IS NOT NULL), '[]') as vehicles,
                   COALESCE(json_agg(wo.*) FILTER (WHERE wo.id IS NOT NULL), '[]') as "serviceHistory"
            FROM customers c
            LEFT JOIN vehicles v ON c.id = v.customer_id
            LEFT JOIN work_orders wo ON c.id = wo.customer_id
            GROUP BY c.id
            ORDER BY c.name
        `);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/customers", async (req, res) => {
  const { name, phone, email, birthday, vehicles } = req.body;
  const client: PoolClient = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const customerRes = await client.query(
      "INSERT INTO customers (name, phone, email, birthday) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, phone, email, birthday]
    );
    const newCustomer = customerRes.rows[0];

    const insertedVehicles = [];
    for (const vehicle of vehicles) {
      const vehicleRes = await client.query(
        "INSERT INTO vehicles (customer_id, plate, model, color, observations) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          newCustomer.id,
          vehicle.plate,
          vehicle.model,
          vehicle.color,
          vehicle.observations,
        ]
      );
      insertedVehicles.push(vehicleRes.rows[0]);
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({ ...newCustomer, vehicles: insertedVehicles, serviceHistory: [] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, birthday } = req.body;
    const result = await executeQuery(
      "UPDATE customers SET name = $1, phone = $2, email = $3, birthday = $4 WHERE id = $5 RETURNING *",
      [name, phone, email, birthday, id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM customers WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Products
app.get("/api/products", async (req, res) => {
  try {
    res.json(await executeQuery("SELECT * FROM products ORDER BY name"));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, supplier, cost, stock, minStock } = req.body;
    const result = await executeQuery(
      "INSERT INTO products (name, supplier, cost, stock, min_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, supplier, cost, stock, minStock]
    );
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // In a real app, you'd get the fields to update from req.body
    const current = (
      await executeQuery("SELECT * FROM products WHERE id=$1", [id])
    )[0];
    const {
      name = current.name,
      supplier = current.supplier,
      cost = current.cost,
      stock = current.stock,
      min_stock = current.min_stock,
    } = req.body;

    const result = await executeQuery(
      "UPDATE products SET name=$1, supplier=$2, cost=$3, stock=$4, min_stock=$5 WHERE id=$6 RETURNING *",
      [name, supplier, cost, stock, min_stock, id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await executeQuery("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Services
app.get("/api/services", async (req, res) => {
  try {
    const services = await executeQuery(`
            SELECT s.*,
                   COALESCE(json_agg(json_build_object('productId', sp.product_id, 'quantity', sp.quantity)) FILTER (WHERE sp.product_id IS NOT NULL), '[]') as "productsConsumed"
            FROM services s
            LEFT JOIN service_products sp ON s.id = sp.service_id
            GROUP BY s.id
            ORDER BY s.name
        `);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/services", async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await executeQuery(
      "INSERT INTO services (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    res.status(201).json({ ...result[0], productsConsumed: [] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/services/:id", async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await executeQuery(
      "UPDATE services SET name=$1, price=$2 WHERE id=$3 RETURNING *",
      [name, price, req.params.id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  try {
    await executeQuery("DELETE FROM services WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Work Orders
app.get("/api/work-orders", async (req, res) => {
  try {
    const query = `
            SELECT wo.*,
                   (SELECT row_to_json(c.*) FROM customers c WHERE c.id = wo.customer_id) as customer_details,
                   (SELECT row_to_json(v.*) FROM vehicles v WHERE v.id = wo.vehicle_id) as vehicle_details,
                   COALESCE((SELECT json_agg(s.*) FROM services s JOIN work_order_services wos ON s.id = wos.service_id WHERE wos.work_order_id = wo.id), '[]') as services
            FROM work_orders wo
            ORDER BY wo.checkin_time DESC
        `;
    const workOrders = await executeQuery(query);
    // Map the results to match frontend expectations
    const formatted = workOrders.map((wo) => ({
      ...wo,
      services: wo.services || [],
      // The customer/vehicle details are already part of the main object from the previous logic
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/work-orders", async (req, res) => {
  const {
    customerId,
    vehicleId,
    services,
    employee,
    status,
    checkinTime,
    damageLog,
    total,
    isPaid,
    paymentMethod,
  } = req.body;
  const client: PoolClient = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const woRes = await client.query(
      "INSERT INTO work_orders (customer_id, vehicle_id, employee, status, checkin_time, damage_log, total, is_paid, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        customerId,
        vehicleId,
        employee,
        status,
        checkinTime,
        damageLog,
        total,
        isPaid,
        paymentMethod,
      ]
    );
    const newWorkOrder = woRes.rows[0];
    for (const service of services) {
      await client.query(
        "INSERT INTO work_order_services (work_order_id, service_id) VALUES ($1, $2)",
        [newWorkOrder.id, service.id]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ ...newWorkOrder, services });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

app.put("/api/work-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isPaid, paymentMethod } = req.body;
    const checkoutTime =
      status === "Entregue" || status === "Finalizado"
        ? new Date().toISOString()
        : null;

    const result = await executeQuery(
      "UPDATE work_orders SET status=$1, is_paid=$2, payment_method=$3, checkout_time=$4 WHERE id=$5 RETURNING *",
      [status, isPaid, paymentMethod, checkoutTime, id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/work-orders/:id", async (req, res) => {
  try {
    await executeQuery("DELETE FROM work_orders WHERE id = $1", [
      req.params.id,
    ]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Expenses
app.get("/api/expenses", async (req, res) => {
  try {
    res.json(await executeQuery("SELECT * FROM expenses ORDER BY date DESC"));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const { description, category, amount, date } = req.body;
    const result = await executeQuery(
      "INSERT INTO expenses (description, category, amount, date) VALUES ($1, $2, $3, $4) RETURNING *",
      [description, category, amount, date]
    );
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { description, category, amount, date } = req.body;
    const result = await executeQuery(
      "UPDATE expenses SET description=$1, category=$2, amount=$3, date=$4 WHERE id=$5 RETURNING *",
      [description, category, amount, date, req.params.id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await executeQuery("DELETE FROM expenses WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Dashboard Data
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const revenueRes = await executeQuery(
      `SELECT SUM(total) as total_revenue FROM work_orders WHERE is_paid = true`
    );
    const expensesRes = await executeQuery(
      `SELECT SUM(amount) as total_expenses FROM expenses`
    );
    const activeWoRes = await executeQuery(
      `SELECT COUNT(*) as active_work_orders FROM work_orders WHERE status != 'Entregue'`
    );
    const customersRes = await executeQuery(
      `SELECT COUNT(*) as total_customers FROM customers`
    );

    res.json({
      totalRevenue: parseFloat(revenueRes[0].total_revenue) || 0,
      totalExpenses: parseFloat(expensesRes[0].total_expenses) || 0,
      activeWorkOrders: parseInt(activeWoRes[0].active_work_orders, 10) || 0,
      totalCustomers: parseInt(customersRes[0].total_customers, 10) || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/dashboard/financial-chart", async (req, res) => {
  try {
    // Mock data for now, replace with real query
    const data = [
      { name: "Jan", Receitas: 4000, Custos: 2400 },
      { name: "Fev", Receitas: 3000, Custos: 1398 },
      { name: "Mar", Receitas: 2000, Custos: 9800 },
      { name: "Abr", Receitas: 2780, Custos: 3908 },
      { name: "Mai", Receitas: 1890, Custos: 4800 },
      { name: "Jun", Receitas: 2390, Custos: 3800 },
    ];
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
