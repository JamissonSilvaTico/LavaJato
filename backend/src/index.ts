// Fix: Replaced CommonJS import assignments with ES module import syntax and imported Request/Response types.
import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import db from "./db";
import { PoolClient } from "pg";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173", // Frontend de desenvolvimento
];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Não permitido pela política de CORS"));
    }
  },
};

app.use(cors(corsOptions));
// --- Fim da Configuração CORS ---

// Fix: Using the correctly imported 'express' module resolves the overload error for middleware.
app.use(express.json());

// Rota de verificação de saúde
// Fix: Used imported Request and Response types.
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Erro na consulta ao banco de dados:", error);
    throw error;
  }
};

// --- Rotas da API ---

// Clientes
// Fix: Used imported Request and Response types.
app.get("/api/customers", async (req: Request, res: Response) => {
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
    // O histórico de serviços precisa ser enriquecido com os detalhes dos serviços.
    for (const customer of customers) {
      for (const order of customer.serviceHistory) {
        const servicesRes = await executeQuery(
          "SELECT s.* FROM services s JOIN work_order_services wos ON s.id = wos.service_id WHERE wos.work_order_id = $1",
          [order.id]
        );
        order.services = servicesRes;
      }
    }
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.post("/api/customers", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    client.release();
  }
});

// Fix: Used imported Request and Response types.
app.put("/api/customers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, birthday } = req.body;
    const result = await executeQuery(
      "UPDATE customers SET name = $1, phone = $2, email = $3, birthday = $4 WHERE id = $5 RETURNING *",
      [name, phone, email, birthday, id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.delete("/api/customers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM customers WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Produtos
// Fix: Used imported Request and Response types.
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    res.json(await executeQuery("SELECT * FROM products ORDER BY name"));
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const { name, supplier, cost, stock, minStock } = req.body;
    const result = await executeQuery(
      "INSERT INTO products (name, supplier, cost, stock, min_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, supplier, cost, stock, minStock]
    );
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    await executeQuery("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Serviços
// Fix: Used imported Request and Response types.
app.get("/api/services", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.post("/api/services", async (req: Request, res: Response) => {
  try {
    const { name, price } = req.body;
    const result = await executeQuery(
      "INSERT INTO services (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    res.status(201).json({ ...result[0], productsConsumed: [] });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.put("/api/services/:id", async (req: Request, res: Response) => {
  try {
    const { name, price } = req.body;
    const result = await executeQuery(
      "UPDATE services SET name=$1, price=$2 WHERE id=$3 RETURNING *",
      [name, price, req.params.id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.delete("/api/services/:id", async (req: Request, res: Response) => {
  try {
    await executeQuery("DELETE FROM services WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Ordens de Serviço
// Fix: Used imported Request and Response types.
app.get("/api/work-orders", async (req: Request, res: Response) => {
  try {
    const query = `
            SELECT wo.*,
                   COALESCE((SELECT json_agg(s.*) FROM services s JOIN work_order_services wos ON s.id = wos.service_id WHERE wos.work_order_id = wo.id), '[]') as services
            FROM work_orders wo
            ORDER BY wo.checkin_time DESC
        `;
    const workOrders = await executeQuery(query);
    res.json(workOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.post("/api/work-orders", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    client.release();
  }
});

// Fix: Used imported Request and Response types.
app.put("/api/work-orders/:id", async (req: Request, res: Response) => {
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
    const updatedOrder = result[0];
    const servicesRes = await executeQuery(
      "SELECT s.* FROM services s JOIN work_order_services wos ON s.id = wos.service_id WHERE wos.work_order_id = $1",
      [updatedOrder.id]
    );
    res.json({ ...updatedOrder, services: servicesRes });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.delete("/api/work-orders/:id", async (req: Request, res: Response) => {
  try {
    await executeQuery("DELETE FROM work_orders WHERE id = $1", [
      req.params.id,
    ]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Despesas
// Fix: Used imported Request and Response types.
app.get("/api/expenses", async (req: Request, res: Response) => {
  try {
    res.json(await executeQuery("SELECT * FROM expenses ORDER BY date DESC"));
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.post("/api/expenses", async (req: Request, res: Response) => {
  try {
    const { description, category, amount, date } = req.body;
    const result = await executeQuery(
      "INSERT INTO expenses (description, category, amount, date) VALUES ($1, $2, $3, $4) RETURNING *",
      [description, category, amount, date]
    );
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.put("/api/expenses/:id", async (req: Request, res: Response) => {
  try {
    const { description, category, amount, date } = req.body;
    const result = await executeQuery(
      "UPDATE expenses SET description=$1, category=$2, amount=$3, date=$4 WHERE id=$5 RETURNING *",
      [description, category, amount, date, req.params.id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.delete("/api/expenses/:id", async (req: Request, res: Response) => {
  try {
    await executeQuery("DELETE FROM expenses WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Dados do Dashboard
// Fix: Used imported Request and Response types.
app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
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
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Fix: Used imported Request and Response types.
app.get(
  "/api/dashboard/financial-chart",
  async (req: Request, res: Response) => {
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
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
