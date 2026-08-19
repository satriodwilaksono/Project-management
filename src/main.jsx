import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import {ClerkProvider} from '@clerk/clerk-react'

//import your publisher key
const publisherKey= import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publisherKey) {
  throw new Error("Missing CLERK_PUBLISHABLE_KEY")
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <ClerkProvider publishableKey={publisherKey}>
            <Provider store={store}>
                <App />
            </Provider>
    </ClerkProvider>
    </BrowserRouter>
);