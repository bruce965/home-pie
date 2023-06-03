import { createRoot } from 'react-dom/client';
import { Root } from './components/root';

const div = document.createElement('div');
document.body.appendChild(div);

const root = createRoot(div);
root.render(<Root />);
