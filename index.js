// Import the required libraries
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 5000;
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

console.log("Connecting to MongoDB...");
client.connect()
  .then(() => {
    console.log("Connected to MongoDB");
    const dbName = 'taskManager';
    const db = client.db(dbName);
    const tasksCollection = db.collection('tasks');

    app.get('/', (req, res) => {
      res.send('Hello, CloudNimbus! The server is running.');
    });

    // Create a new task (POST)
    app.post('/api/tasks', async (req, res) => {
      const task = req.body;
      try {
        const result = await tasksCollection.insertOne(task);
        res.status(201).json(result.ops[0]); // Send back the created task
      } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
      }
    });

    // Get all tasks (GET)
    app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
    });

    // Update a task (PUT)
    app.put('/api/tasks/:id', async (req, res) => {
      const { id } = req.params;
      const updatedTask = req.body;
      try {
        const result = await tasksCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: updatedTask }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
      }
    });

    // Delete a task (DELETE)
    app.delete('/api/tasks/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await tasksCollection.deleteOne({ _id: ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
      }
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
