import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface Task {
    id: number;
    title: string;
    completed: boolean;
}

interface TaskContextType {
    incompleteTasks: Task[];
    refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType>({ incompleteTasks: [], refreshTasks: () => {} });

export function TaskProvider({ children }: { children: ReactNode }) {
    const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);

    const refreshTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setIncompleteTasks(response.data.filter((t: Task) => !t.completed));
        } catch (err) {
            console.error('Failed to fetch tasks');
        }
    };

    useEffect(() => {
        refreshTasks();
    }, []);

    return (
        <TaskContext.Provider value={{ incompleteTasks, refreshTasks }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTaskContext = () => useContext(TaskContext);