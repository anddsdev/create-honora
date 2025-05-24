import { Hono } from 'hono';

export const apiRouter = new Hono();

// Example API endpoints
apiRouter.get('/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

apiRouter.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({
    id: Number(id),
    name: 'John Doe',
    email: 'john@example.com',
  });
});

apiRouter.post('/users', async (c) => {
  const body = await c.req.json();
  return c.json({
    message: 'User created',
    user: {
      id: 3,
      ...body,
    },
  }, 201);
}); 