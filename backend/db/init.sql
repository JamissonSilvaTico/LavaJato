-- TABELA 1: Funcionarios
CREATE TABLE Funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- TABELA 2: Clientes
CREATE TABLE Clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100) UNIQUE
);

-- TABELA 3: Veiculos
CREATE TABLE Veiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL, -- Placa é única
    modelo VARCHAR(50) NOT NULL,
    cor VARCHAR(30),
    cliente_id INT NOT NULL, -- Quem é o dono do veículo

    CONSTRAINT fk_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES Clientes (id)
        ON DELETE CASCADE -- Se o cliente for excluído, os veículos dele também são
);

-- TABELA 4: Tipos_Servico (Os preços e tipos de lavagem)
CREATE TABLE Tipos_Servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL
);

-- TABELA 5: Ordens_Servico (Agendamentos ou serviços realizados)
CREATE TABLE Ordens_Servico (
    id SERIAL PRIMARY KEY,
    veiculo_id INT NOT NULL,
    data_hora_agendamento TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Agendado', -- Ex: Agendado, Em Andamento, Concluído, Cancelado
    funcionario_id INT,
    valor_total NUMERIC(10, 2) NOT NULL,
    
    CONSTRAINT fk_veiculo
        FOREIGN KEY (veiculo_id)
        REFERENCES Veiculos (id)
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES Funcionarios (id)
        ON DELETE SET NULL
);

-- TABELA 6: Servicos_Ordem (Tabela N:M para ligar uma Ordem_Servico a vários Tipos_Servico)
CREATE TABLE Servicos_Ordem (
    ordem_id INT NOT NULL,
    tipo_servico_id INT NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL,

    PRIMARY KEY (ordem_id, tipo_servico_id), -- Chave primária composta
    
    CONSTRAINT fk_ordem
        FOREIGN KEY (ordem_id)
        REFERENCES Ordens_Servico (id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_tipo_servico
        FOREIGN KEY (tipo_servico_id)
        REFERENCES Tipos_Servico (id)
        ON DELETE RESTRICT
);