const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Personal Task Manager API is running',
        endpoints: {
            tasks: '/api/tasks'
        }
    });
});

async function readTasksFromFile() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeTasksToFile(tasks) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// 1. GET: Fetch all tasks (Sorted by newest first)
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasksFromFile();
        const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sortedTasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read tasks data' });
    }
});

// 2. POST: Create a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }
        const tasks = await readTasksFromFile();
        const newTask = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description ? description.trim() : '',
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        await writeTasksToFile(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save new task' });
    }
});

// 3. PATCH: Update a task
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let tasks = await readTasksFromFile();
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
        
        delete updates.id;
        delete updates.createdAt;
        
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        await writeTasksToFile(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// 4. DELETE: Remove a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let tasks = await readTasksFromFile();
        const taskExists = tasks.some(task => task.id === id);
        if (!taskExists) return res.status(404).json({ error: 'Task not found' });
        
        const updatedTasks = tasks.filter(task => task.id !== id);
        await writeTasksToFile(updatedTasks);
        res.json({ message: 'Task deleted successfully', id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
