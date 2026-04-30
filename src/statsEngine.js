// Unified Stats Engine - loads all Python functions into Pyodide
import { getPyodide } from './pyodideLoader';
import { doePython, runTwoFactor, runLatinSquare, runStripPlot, runLayout, runThreeFactor } from './engineDOE';
import { descPython, runFrequency, runCrosstab, runComparingMeans, runCorrelation, runRegression, runPCA, runKMeans, runProbit } from './engineDesc';
import { biomPython, runPathAnalysis, runDiallel, runStability, runLineTester, runAugmented, runGenMeans, runPooledRBD, runMulComp } from './engineBiom';

let engineInstance = null;
let isReady = false;
let enginePromise = null;

export const initEngine = async (options = {}) => {
  if (engineInstance && isReady) return engineInstance;
  if (enginePromise) return enginePromise;

  enginePromise = (async () => {
    const pyodide = await getPyodide(options);
    options.onStage?.('registering-functions');
    pyodide.runPython(oneFactorPython);
    pyodide.runPython(doePython);
    pyodide.runPython(descPython);
    pyodide.runPython(biomPython);
    engineInstance = pyodide;
    isReady = true;
    options.onStage?.('ready');
    return engineInstance;
  })();

  try {
    return await enginePromise;
  } catch (err) {
    enginePromise = null;
    isReady = false;
    console.error("Pyodide init failed:", err);
    throw err;
  }
};

// Original one-factor Python (CRD/RBD)
const oneFactorPython = `
import json
import numpy as np
import scipy.stats as stats

def run_one_factor(data_str, treatments, replications, design):
    raw_data = data_str.replace('\\t', ' ').replace('\\r', ' ').replace('\\n', ' ')
    values = np.array([float(x) for x in raw_data.split() if x.strip()])
    T = int(treatments)
    R = int(replications)
    if len(values) != T * R:
        raise ValueError(f"Expected {T*R} values, but got {len(values)}")
    matrix = values.reshape((T, R))
    G = np.sum(matrix)
    N = T * R
    CF = (G ** 2) / N
    TSS = np.sum(matrix ** 2) - CF
    Tr_totals = np.sum(matrix, axis=1)
    TrSS = np.sum(Tr_totals ** 2) / R - CF
    Tr_means = Tr_totals / R
    Grand_mean = G / N
    df_TSS = N - 1
    df_Tr = T - 1
    if design.upper() == 'CRD':
        ESS = TSS - TrSS
        df_E = df_TSS - df_Tr
        MSTr = TrSS / df_Tr
        MSE = ESS / df_E
        F_Tr = MSTr / MSE
        p_Tr = 1.0 - stats.f.cdf(F_Tr, df_Tr, df_E)
        anova = [
            {"source": "Treatment", "df": df_Tr, "ss": TrSS, "ms": MSTr, "f": F_Tr, "p": p_Tr},
            {"source": "Error", "df": df_E, "ss": ESS, "ms": MSE, "f": None, "p": None},
            {"source": "Total", "df": df_TSS, "ss": TSS, "ms": None, "f": None, "p": None}
        ]
    elif design.upper() == 'RBD':
        Rep_totals = np.sum(matrix, axis=0)
        RSS = np.sum(Rep_totals ** 2) / T - CF
        df_R = R - 1
        ESS = TSS - TrSS - RSS
        df_E = df_TSS - df_Tr - df_R
        MSTr = TrSS / df_Tr
        MSR = RSS / df_R
        MSE = ESS / df_E
        F_Tr = MSTr / MSE
        p_Tr = 1.0 - stats.f.cdf(F_Tr, df_Tr, df_E)
        F_R = MSR / MSE
        p_R = 1.0 - stats.f.cdf(F_R, df_R, df_E)
        anova = [
            {"source": "Replication", "df": df_R, "ss": RSS, "ms": MSR, "f": F_R, "p": p_R},
            {"source": "Treatment", "df": df_Tr, "ss": TrSS, "ms": MSTr, "f": F_Tr, "p": p_Tr},
            {"source": "Error", "df": df_E, "ss": ESS, "ms": MSE, "f": None, "p": None},
            {"source": "Total", "df": df_TSS, "ss": TSS, "ms": None, "f": None, "p": None}
        ]
    else:
        raise ValueError("Design must be CRD or RBD")
    SE_m = np.sqrt(MSE / R)
    SE_d = np.sqrt(2 * MSE / R)
    cv_percent = (np.sqrt(MSE) / Grand_mean) * 100
    t_val_5 = stats.t.ppf(1 - 0.05/2, df_E)
    t_val_1 = stats.t.ppf(1 - 0.01/2, df_E)
    cd_5 = SE_d * t_val_5
    cd_1 = SE_d * t_val_1
    means_obj = []
    for i, m in enumerate(Tr_means):
        tr_vals = matrix[i]
        tr_std = np.std(tr_vals, ddof=1) if len(tr_vals)>1 else 0.0
        tr_se = tr_std / np.sqrt(R)
        means_obj.append({"label": f"T{i+1}", "mean": m, "se": tr_se})
    result = {
        "anova": anova,
        "SE_m": SE_m,
        "SE_d": SE_d,
        "CV": cv_percent,
        "CD_5": cd_5,
        "CD_1": cd_1,
        "grand_mean": Grand_mean,
        "means": means_obj
    }
    return json.dumps(result)
`;

// ═══ Unified analysis dispatcher ═══
export const analyzeOneFactor = async (dataStr, treatments, replications, design, options) => {
  const pyodide = await initEngine(options);
  const runAnova = pyodide.globals.get('run_one_factor');
  try {
    const rawJson = runAnova(dataStr, parseInt(treatments, 10), parseInt(replications, 10), design);
    return JSON.parse(rawJson);
  } catch (err) {
    throw new Error(err.message.split('ValueError:')[1] || err.message);
  } finally {
    if (runAnova) runAnova.destroy();
  }
};

// Dispatch map: toolId → analysis function
export const runAnalysis = async (toolId, data, opts, options = {}) => {
  const py = await initEngine(options);

  switch (toolId) {
    case 'onefactor':
      return analyzeOneFactor(data, opts.treatments, opts.replications, opts.design || 'RBD', options);
    case 'twofactor':
      return runTwoFactor(py, data, opts.f1, opts.f2, opts.replications);
    case 'threefactor':
      return runThreeFactor(py, data, opts.f1, opts.f2, opts.f3, opts.replications || '3');
    case 'latin':
      return runLatinSquare(py, data, opts.size);
    case 'strip':
      return runStripPlot(py, data, opts.f1, opts.f2, opts.replications);
    case 'layouts':
      return runLayout(py, opts.design || 'RBD', opts.treatments, opts.replications);
    case 'mulcomp':
      return runMulComp(py, data, opts.treatments || '3', opts.replications || '4', opts.test || 'LSD');
    case 'pooled':
      return runPooledRBD(py, data, opts.treatments || '3', opts.replications || '4', opts.envs);
    case 'splitenv':
      return runPooledRBD(py, data, opts.treatments || '3', opts.replications || '3', opts.envs);
    case 'frequency':
      return runFrequency(py, data, opts.classes || '8');
    case 'crosstab':
      return runCrosstab(py, data);
    case 'means':
      return runComparingMeans(py, data, opts.test || 't-test');
    case 'correlation':
      return runCorrelation(py, data, opts.variables || '3');
    case 'regression':
      return runRegression(py, data, opts.variables || '3');
    case 'genmean':
      return runGenMeans(py, data);
    case 'path':
      return runPathAnalysis(py, data, opts.variables || '4');
    case 'diallel':
      return runDiallel(py, data, opts.parents, opts.method || 'II', opts.replications || '3');
    case 'partialdial':
      return runDiallel(py, data, opts.parents || '8', 'II', opts.replications || '3');
    case 'stability':
      return runStability(py, data, opts.genotypes || '5', opts.envs || '3', opts.replications || '3');
    case 'linetester':
      return runLineTester(py, data, opts.lines, opts.testers, opts.replications || '3');
    case 'augmented':
      return runAugmented(py, data, opts.checks || '3', opts.blocks || '4');
    case 'lattice':
      return runAugmented(py, data, opts.k || '4', '1');
    case 'pbibd':
      return runAugmented(py, data, opts.k || '5', opts.reps || '3');
    case 'ttc':
      return runGenMeans(py, data);
    case 'pca':
      return runPCA(py, data, opts.variables || '4');
    case 'kmean':
      return runKMeans(py, data, opts.variables || '3', opts.k || '3', opts.iter || '100');
    case 'probit':
      return runProbit(py, data);
    default:
      throw new Error(`Unknown tool: ${toolId}`);
  }
};
