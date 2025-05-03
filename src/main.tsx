import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import './index.css'
import { createStore, Provider } from 'jotai'

export const store = createStore();

 createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
      <App />
      </Provider>
    </StrictMode>,
  )

