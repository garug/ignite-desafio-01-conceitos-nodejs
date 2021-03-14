const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const savedUser = users.find((u) => u.username === username);

  if (savedUser) {
    response.locals.user = savedUser;
    next();
  } else {
    response.status(404).json({ error: "User not found" });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const savedUser = users.find((u) => u.username === username);

  if (savedUser)
    return response.status(400).json({ error: "User already exists" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { title, deadline } = request.body;
  const todo = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    created_at: new Date(),
    done: false,
  };
  user.todos = [...user.todos, todo];
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((t) => t.id === id);

  if (todoIndex === -1)
    return response.status(404).json({ error: "Todo not exists" });

  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    title,
    deadline,
  };

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { id } = request.params;

  const todo = user.todos.find((t) => t.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not exists" });

  todo.done = !todo.done;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = response.locals;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((t) => t.id === id);

  if (todoIndex === -1)
    return response.status(404).json({ error: "Todo not exists" });

  user.todos = user.todos.filter((t) => t.id !== id);

  return response.status(204).send();
});

module.exports = app;
