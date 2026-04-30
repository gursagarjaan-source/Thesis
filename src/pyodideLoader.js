const PYODIDE_VERSION = '0.25.1';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const MAX_SCRIPT_WAIT_MS = 15000;

let pyodideInstance = null;
let loadingPromise = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForLoadPyodide = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only run in the browser.');
  }

  const startedAt = Date.now();
  while (typeof window.loadPyodide !== 'function') {
    if (Date.now() - startedAt > MAX_SCRIPT_WAIT_MS) {
      throw new Error('Pyodide script did not load. Check your internet connection and try again.');
    }
    await wait(150);
  }

  return window.loadPyodide;
};

export const getPyodide = async ({ onStage } = {}) => {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    onStage?.('loading-script');
    const loadPyodide = await waitForLoadPyodide();

    onStage?.('loading-runtime');
    const pyodide = await loadPyodide({ indexURL: PYODIDE_BASE_URL });

    onStage?.('loading-packages');
    await pyodide.loadPackage(['numpy', 'scipy']);

    pyodideInstance = pyodide;
    onStage?.('ready');
    return pyodideInstance;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
};

export const preloadPyodide = () => {
  getPyodide().catch((error) => {
    console.warn('Pyodide preload failed:', error);
  });
};
