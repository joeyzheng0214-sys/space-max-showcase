import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/roboto-mono/latin-400.css';
import {createRoot} from 'react-dom/client';
import {ShowcaseApp} from './ShowcaseApp';
import './styles.css';
import './showcase.css';
createRoot(document.getElementById('root')!).render(<ShowcaseApp/>);
