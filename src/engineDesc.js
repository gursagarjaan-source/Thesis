// Descriptive + Multivariate Python scripts for Pyodide
export const descPython = `
def run_frequency(data_str, classes):
    import json, numpy as np
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    k=int(classes); mn=np.min(vals); mx=np.max(vals)
    edges=np.linspace(mn,mx,k+1)
    freq,_=np.histogram(vals,bins=edges)
    total=len(vals); cum=0; rows=[]
    for i in range(k):
        cum+=int(freq[i])
        rows.append({"lower":float(edges[i]),"upper":float(edges[i+1]),"freq":int(freq[i]),"rel":float(freq[i]/total*100),"cum":cum})
    return json.dumps({"rows":rows,"n":total,"mean":float(np.mean(vals)),"std":float(np.std(vals,ddof=1)),"min":float(mn),"max":float(mx),"median":float(np.median(vals))})

def run_crosstab(data_str):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = [float(x) for x in raw.split() if x.strip()]
    n=len(vals); half=n//2
    r=np.array(vals[:half],dtype=int); c=np.array(vals[half:],dtype=int)
    ur=np.unique(r); uc=np.unique(c)
    table=np.zeros((len(ur),len(uc)),dtype=int)
    for i in range(half): table[np.where(ur==r[i])[0][0],np.where(uc==c[i])[0][0]]+=1
    chi2,p,dof,exp=stats.chi2_contingency(table)
    return json.dumps({"table":table.tolist(),"row_labels":[int(x) for x in ur],"col_labels":[int(x) for x in uc],"chi2":float(chi2),"p":float(p),"dof":int(dof),"expected":exp.tolist()})

def run_comparing_means(data_str, test_type):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = [float(x) for x in raw.split() if x.strip()]
    n=len(vals); half=n//2
    g1=np.array(vals[:half]); g2=np.array(vals[half:])
    if test_type.lower()=='paired':
        t,p=stats.ttest_rel(g1,g2)
    else:
        t,p=stats.ttest_ind(g1,g2)
    return json.dumps({"t":float(t),"p":float(p),"mean1":float(np.mean(g1)),"mean2":float(np.mean(g2)),"std1":float(np.std(g1,ddof=1)),"std2":float(np.std(g2,ddof=1)),"n1":len(g1),"n2":len(g2),"test":test_type})

def run_correlation(data_str, nvars):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    p=int(nvars); n=len(vals)//p
    data=vals.reshape((n,p))
    corr=np.corrcoef(data,rowvar=False)
    pvals=np.zeros((p,p))
    for i in range(p):
        for j in range(p):
            if i!=j:
                r,pv=stats.pearsonr(data[:,i],data[:,j])
                pvals[i,j]=pv
    return json.dumps({"matrix":corr.tolist(),"pvalues":pvals.tolist(),"n":n,"variables":p})

def run_regression(data_str, nvars):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    p=int(nvars); n=len(vals)//p
    data=vals.reshape((n,p))
    Y=data[:,-1]; X=data[:,:-1]
    X_=np.column_stack([np.ones(n),X])
    beta=np.linalg.lstsq(X_,Y,rcond=None)[0]
    Yhat=X_@beta; resid=Y-Yhat
    SSR=np.sum((Yhat-np.mean(Y))**2); SSE=np.sum(resid**2); SST=SSR+SSE
    k=X.shape[1]; df_r=k; df_e=n-k-1; df_t=n-1
    R2=SSR/SST if SST>0 else 0; adjR2=1-(1-R2)*(n-1)/(n-k-1) if n-k-1>0 else 0
    MSR=SSR/df_r if df_r>0 else 0; MSE=SSE/df_e if df_e>0 else 1e-10
    F=MSR/MSE; pF=1-stats.f.cdf(F,df_r,df_e) if df_e>0 else None
    se_beta=np.sqrt(np.diag(MSE*np.linalg.inv(X_.T@X_))) if df_e>0 else np.zeros(k+1)
    t_beta=beta/se_beta; p_beta=[float(2*(1-stats.t.cdf(abs(t),df_e))) for t in t_beta]
    coeffs=[{"name":"Intercept" if i==0 else f"X{i}","coeff":float(beta[i]),"se":float(se_beta[i]),"t":float(t_beta[i]),"p":p_beta[i]} for i in range(len(beta))]
    anova=[
      {"source":"Regression","df":int(df_r),"ss":float(SSR),"ms":float(MSR),"f":float(F),"p":float(pF) if pF else None},
      {"source":"Error","df":int(df_e),"ss":float(SSE),"ms":float(MSE),"f":None,"p":None},
      {"source":"Total","df":int(df_t),"ss":float(SST),"ms":None,"f":None,"p":None}
    ]
    return json.dumps({"coefficients":coeffs,"anova":anova,"R2":float(R2),"adjR2":float(adjR2),"n":n})

def run_pca(data_str, nvars):
    import json, numpy as np
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    p=int(nvars); n=len(vals)//p; data=vals.reshape((n,p))
    data_s=(data-np.mean(data,axis=0))/np.std(data,axis=0,ddof=1)
    cov=np.cov(data_s,rowvar=False)
    eigvals,eigvecs=np.linalg.eigh(cov)
    idx=np.argsort(eigvals)[::-1]; eigvals=eigvals[idx]; eigvecs=eigvecs[:,idx]
    total=np.sum(eigvals)
    components=[]
    cum=0
    for i in range(p):
        prop=float(eigvals[i]/total*100); cum+=prop
        components.append({"pc":i+1,"eigenvalue":float(eigvals[i]),"proportion":prop,"cumulative":cum})
    loadings=eigvecs.tolist()
    return json.dumps({"components":components,"loadings":loadings,"n":n,"variables":p})

def run_kmeans(data_str, nvars, k, max_iter):
    import json, numpy as np
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    p=int(nvars); n=len(vals)//p; data=vals.reshape((n,p))
    K=int(k); mi=int(max_iter)
    idx=np.random.choice(n,K,replace=False); centroids=data[idx].copy()
    labels=np.zeros(n,dtype=int)
    for _ in range(mi):
        for i in range(n):
            dists=[np.sum((data[i]-centroids[j])**2) for j in range(K)]
            labels[i]=np.argmin(dists)
        new_c=np.array([data[labels==j].mean(axis=0) if np.sum(labels==j)>0 else centroids[j] for j in range(K)])
        if np.allclose(new_c,centroids): break
        centroids=new_c
    clusters=[]
    for j in range(K):
        mask=labels==j
        clusters.append({"cluster":j+1,"size":int(np.sum(mask)),"centroid":centroids[j].tolist(),"members":[int(i+1) for i in range(n) if mask[i]]})
    return json.dumps({"clusters":clusters,"n":n,"k":K})

def run_probit(data_str):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = [float(x) for x in raw.split() if x.strip()]
    n=len(vals)//3
    dose=np.array(vals[:n]); total=np.array(vals[n:2*n]); resp=np.array(vals[2*n:3*n])
    prop=resp/total; logdose=np.log10(dose+1e-10)
    probit_y=np.array([stats.norm.ppf(min(max(p,0.01),0.99))+5 for p in prop])
    slope,intercept,r,p,se=stats.linregress(logdose,probit_y)
    lc50=10**(((5-intercept)/slope) if slope!=0 else 0)
    lc90=10**(((6.28-intercept)/slope) if slope!=0 else 0)
    return json.dumps({"slope":float(slope),"intercept":float(intercept),"r2":float(r**2),"lc50":float(lc50),"lc90":float(lc90),"n":n})
`;

export const runFrequency = async (py, data, classes) => {
  const fn = py.globals.get('run_frequency');
  try { return JSON.parse(fn(data, parseInt(classes))); } finally { fn.destroy(); }
};
export const runCrosstab = async (py, data) => {
  const fn = py.globals.get('run_crosstab');
  try { return JSON.parse(fn(data)); } finally { fn.destroy(); }
};
export const runComparingMeans = async (py, data, test) => {
  const fn = py.globals.get('run_comparing_means');
  try { return JSON.parse(fn(data, test)); } finally { fn.destroy(); }
};
export const runCorrelation = async (py, data, nvars) => {
  const fn = py.globals.get('run_correlation');
  try { return JSON.parse(fn(data, parseInt(nvars))); } finally { fn.destroy(); }
};
export const runRegression = async (py, data, nvars) => {
  const fn = py.globals.get('run_regression');
  try { return JSON.parse(fn(data, parseInt(nvars))); } finally { fn.destroy(); }
};
export const runPCA = async (py, data, nvars) => {
  const fn = py.globals.get('run_pca');
  try { return JSON.parse(fn(data, parseInt(nvars))); } finally { fn.destroy(); }
};
export const runKMeans = async (py, data, nvars, k, iter) => {
  const fn = py.globals.get('run_kmeans');
  try { return JSON.parse(fn(data, parseInt(nvars), parseInt(k), parseInt(iter))); } finally { fn.destroy(); }
};
export const runProbit = async (py, data) => {
  const fn = py.globals.get('run_probit');
  try { return JSON.parse(fn(data)); } finally { fn.destroy(); }
};
