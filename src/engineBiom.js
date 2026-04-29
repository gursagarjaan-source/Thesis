// Biometrical Methods Python scripts for Pyodide
export const biomPython = `
def run_path_analysis(data_str, nvars):
    import json, numpy as np
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    p=int(nvars); n=len(vals)//p; data=vals.reshape((n,p))
    Y=data[:,-1]; X=data[:,:-1]; k=X.shape[1]
    corr=np.corrcoef(data,rowvar=False)
    Rxx=corr[:k,:k]; Rxy=corr[:k,-1]
    path_coeffs=np.linalg.solve(Rxx,Rxy)
    effects=[]
    for i in range(k):
        direct=float(path_coeffs[i])
        indirect=[]
        for j in range(k):
            if i!=j: indirect.append({"via":f"X{j+1}","value":float(corr[i,j]*path_coeffs[j])})
        total=float(corr[i,-1])
        effects.append({"variable":f"X{i+1}","direct":direct,"indirect":indirect,"total":total})
    residual=float(np.sqrt(max(0,1-np.dot(Rxy,path_coeffs))))
    return json.dumps({"effects":effects,"residual":residual,"correlation":corr.tolist(),"n":n})

def run_diallel(data_str, parents, method, reps):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    p=int(parents); r=int(reps)
    crosses=p*(p-1)//2
    if method=='II': n_entries=p+crosses
    else: n_entries=crosses
    total_vals=n_entries*r
    if len(vals)!=total_vals: raise ValueError(f"Need {total_vals} values, got {len(vals)}")
    data=vals.reshape((n_entries,r))
    means=np.mean(data,axis=1)
    G=np.sum(data); N=len(vals); CF=G**2/N
    TSS=np.sum(data**2)-CF
    entry_t=np.sum(data,axis=1); EntrySS=np.sum(entry_t**2)/r-CF
    ESS=TSS-EntrySS
    df_e=n_entries*(r-1); ms_e=ESS/df_e if df_e>0 else 1e-10
    gca_effects=[]; sca_effects=[]
    for i in range(p):
        gca_effects.append({"parent":f"P{i+1}","gca":float(means[i]-np.mean(means)) if i<len(means) else 0})
    anova=[
      {"source":"Entries","df":int(n_entries-1),"ss":float(EntrySS),"ms":float(EntrySS/(n_entries-1)),"f":float(EntrySS/(n_entries-1)/ms_e),"p":float(1-stats.f.cdf(EntrySS/(n_entries-1)/ms_e,n_entries-1,df_e))},
      {"source":"Error","df":int(df_e),"ss":float(ESS),"ms":float(ms_e),"f":None,"p":None},
      {"source":"Total","df":int(N-1),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N; se_m=float(np.sqrt(ms_e/r)); se_d=float(np.sqrt(2*ms_e/r))
    t5=stats.t.ppf(0.975,df_e); cd5=se_d*t5; cv=float((np.sqrt(ms_e)/gm)*100)
    mean_list=[{"label":f"E{i+1}","mean":float(means[i]),"se":se_m} for i in range(n_entries)]
    return json.dumps({"anova":anova,"means":mean_list,"gca":gca_effects,"SE_m":se_m,"SE_d":se_d,"CD_5":float(cd5),"CV":cv,"grand_mean":float(gm)})

def run_stability(data_str, genotypes, envs, reps):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    g=int(genotypes); e=int(envs); r=int(reps); N=g*e*r
    if len(vals)!=N: raise ValueError(f"Need {N} values, got {len(vals)}")
    data=vals.reshape((g,e,r))
    means=np.mean(data,axis=2)
    env_means=np.mean(means,axis=0)
    grand_mean=np.mean(means)
    env_index=env_means-grand_mean
    stability=[]
    for i in range(g):
        yi=means[i]; slope,intercept,r_val,p,se=stats.linregress(env_index,yi)
        yhat=intercept+slope*env_index
        s2di=float(np.sum((yi-yhat)**2)/(e-2)) if e>2 else 0
        stability.append({"genotype":f"G{i+1}","mean":float(np.mean(yi)),"bi":float(slope),"s2di":s2di,"r2":float(r_val**2)})
    anova=[]
    gm=grand_mean
    se_m=float(np.std([s["mean"] for s in stability])/np.sqrt(g))
    return json.dumps({"stability":stability,"env_index":env_index.tolist(),"grand_mean":float(gm),"anova":anova,"means":[{"label":s["genotype"],"mean":s["mean"],"se":se_m} for s in stability],"SE_m":se_m,"SE_d":se_m*1.414,"CD_5":0,"CV":0})

def run_line_tester(data_str, lines, testers, reps):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    l=int(lines); t=int(testers); r=int(reps); N=l*t*r
    if len(vals)!=N: raise ValueError(f"Need {N} values, got {len(vals)}")
    data=vals.reshape((r,l,t))
    G=np.sum(data); CF=G**2/N; TSS=np.sum(data**2)-CF
    rep_t=np.sum(data,axis=(1,2)); RSS=np.sum(rep_t**2)/(l*t)-CF
    l_t=np.sum(data,axis=(0,2)); LSS=np.sum(l_t**2)/(t*r)-CF
    t_t=np.sum(data,axis=(0,1)); TSS_t=np.sum(t_t**2)/(l*r)-CF
    lt_t=np.sum(data,axis=0); LTSS=np.sum(lt_t**2)/r-CF-LSS-TSS_t
    ESS=TSS-RSS-LSS-TSS_t-LTSS
    df_r=r-1; df_l=l-1; df_t=t-1; df_lt=(l-1)*(t-1); df_e=l*t*(r-1); df_total=N-1
    ms_l=LSS/df_l; ms_t=TSS_t/df_t; ms_lt=LTSS/df_lt if df_lt>0 else 0
    ms_e=ESS/df_e if df_e>0 else 1e-10
    f_l=ms_l/ms_e; f_t=ms_t/ms_e; f_lt=ms_lt/ms_e
    def pv(f,d1,d2): return float(1-stats.f.cdf(f,d1,d2)) if d2>0 else None
    anova=[
      {"source":"Replication","df":int(df_r),"ss":float(RSS),"ms":float(RSS/df_r),"f":None,"p":None},
      {"source":"Lines","df":int(df_l),"ss":float(LSS),"ms":float(ms_l),"f":float(f_l),"p":pv(f_l,df_l,df_e)},
      {"source":"Testers","df":int(df_t),"ss":float(TSS_t),"ms":float(ms_t),"f":float(f_t),"p":pv(f_t,df_t,df_e)},
      {"source":"Line x Tester","df":int(df_lt),"ss":float(LTSS),"ms":float(ms_lt),"f":float(f_lt),"p":pv(f_lt,df_lt,df_e)},
      {"source":"Error","df":int(df_e),"ss":float(ESS),"ms":float(ms_e),"f":None,"p":None},
      {"source":"Total","df":int(df_total),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N; se_m=float(np.sqrt(ms_e/r)); se_d=float(np.sqrt(2*ms_e/r))
    t5=stats.t.ppf(0.975,df_e); cd5=se_d*t5; cv=float((np.sqrt(ms_e)/gm)*100)
    line_means=[{"label":f"L{i+1}","mean":float(l_t[i]/(t*r)),"se":se_m} for i in range(l)]
    return json.dumps({"anova":anova,"means":line_means,"SE_m":se_m,"SE_d":se_d,"CD_5":float(cd5),"CV":cv,"grand_mean":float(gm)})

def run_augmented(data_str, checks, blocks):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    n=len(vals); gm=float(np.mean(vals)); sd=float(np.std(vals,ddof=1))
    se_m=sd/np.sqrt(n)
    anova=[{"source":"Total","df":int(n-1),"ss":float(np.sum((vals-gm)**2)),"ms":float(sd**2),"f":None,"p":None}]
    means=[{"label":f"E{i+1}","mean":float(vals[i]),"se":se_m} for i in range(min(n,20))]
    return json.dumps({"anova":anova,"means":means,"SE_m":se_m,"SE_d":se_m*1.414,"CD_5":0,"CV":float(sd/gm*100),"grand_mean":gm})

def run_generation_means(data_str):
    import json, numpy as np
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    n=len(vals); gm=float(np.mean(vals))
    means=[{"label":f"Gen{i+1}","mean":float(vals[i]),"se":0} for i in range(n)]
    return json.dumps({"anova":[],"means":means,"SE_m":0,"SE_d":0,"CD_5":0,"CV":0,"grand_mean":gm})

def run_pooled_rbd(data_str, treatments, reps, envs):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    t=int(treatments); r=int(reps); e=int(envs); N=t*r*e
    if len(vals)!=N: raise ValueError(f"Need {N} values, got {len(vals)}")
    data=vals.reshape((e,t,r))
    G=np.sum(data); CF=G**2/N; TSS=np.sum(data**2)-CF
    env_t=np.sum(data,axis=(1,2)); EnvSS=np.sum(env_t**2)/(t*r)-CF
    tr_t=np.sum(data,axis=(0,2)); TrSS=np.sum(tr_t**2)/(r*e)-CF
    te_t=np.sum(data,axis=2); TESS=np.sum(te_t**2)/r-CF-EnvSS-TrSS
    ESS=TSS-EnvSS-TrSS-TESS
    df_env=e-1; df_tr=t-1; df_te=(t-1)*(e-1); df_e=N-1-df_env-df_tr-df_te; df_t=N-1
    ms_tr=TrSS/df_tr; ms_te=TESS/df_te if df_te>0 else 0; ms_e=ESS/df_e if df_e>0 else 1e-10
    f_tr=ms_tr/ms_e; f_te=ms_te/ms_e
    def pv(f,d1,d2): return float(1-stats.f.cdf(f,d1,d2)) if d2>0 else None
    anova=[
      {"source":"Environment","df":int(df_env),"ss":float(EnvSS),"ms":float(EnvSS/df_env),"f":None,"p":None},
      {"source":"Treatment","df":int(df_tr),"ss":float(TrSS),"ms":float(ms_tr),"f":float(f_tr),"p":pv(f_tr,df_tr,df_e)},
      {"source":"T x E","df":int(df_te),"ss":float(TESS),"ms":float(ms_te),"f":float(f_te),"p":pv(f_te,df_te,df_e)},
      {"source":"Pooled Error","df":int(df_e),"ss":float(ESS),"ms":float(ms_e),"f":None,"p":None},
      {"source":"Total","df":int(df_t),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N; se_m=float(np.sqrt(ms_e/(r*e))); se_d=float(np.sqrt(2*ms_e/(r*e)))
    t5=stats.t.ppf(0.975,df_e); cd5=se_d*t5; cv=float((np.sqrt(ms_e)/gm)*100)
    means=[{"label":f"T{i+1}","mean":float(tr_t[i]/(r*e)),"se":se_m} for i in range(t)]
    return json.dumps({"anova":anova,"means":means,"SE_m":se_m,"SE_d":se_d,"CD_5":float(cd5),"CV":cv,"grand_mean":float(gm)})

def run_mulcomp(data_str, treatments, reps, test_type):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    t=int(treatments); r=int(reps)
    if len(vals)!=t*r: raise ValueError(f"Need {t*r} values, got {len(vals)}")
    data=vals.reshape((t,r))
    means=np.mean(data,axis=1); G=np.sum(data); N=t*r; CF=G**2/N
    TSS=np.sum(data**2)-CF; TrSS=np.sum(np.sum(data,axis=1)**2)/r-CF; ESS=TSS-TrSS
    df_e=N-t; MSE=ESS/df_e if df_e>0 else 1e-10
    SE=np.sqrt(MSE/r)
    sorted_idx=np.argsort(means)[::-1]; sorted_means=means[sorted_idx]
    t5=stats.t.ppf(0.975,df_e); lsd=t5*np.sqrt(2*MSE/r)
    groups=[]; current_group='a'; group_map={}
    for i,idx in enumerate(sorted_idx):
        if i==0: group_map[int(idx)]='a'
        else:
            if sorted_means[0]-sorted_means[i]<=lsd: group_map[int(idx)]=group_map[int(sorted_idx[0])]
            else: group_map[int(idx)]=chr(ord('a')+i)
    comparisons=[{"treatment":f"T{int(sorted_idx[i])+1}","mean":float(sorted_means[i]),"group":group_map.get(int(sorted_idx[i]),'?')} for i in range(t)]
    return json.dumps({"comparisons":comparisons,"lsd":float(lsd),"mse":float(MSE),"df_error":int(df_e),"se":float(SE),"test":test_type})
`;

export const runPathAnalysis = async (py, data, nvars) => {
  const fn = py.globals.get('run_path_analysis');
  try { return JSON.parse(fn(data, parseInt(nvars))); } finally { fn.destroy(); }
};
export const runDiallel = async (py, data, parents, method, reps) => {
  const fn = py.globals.get('run_diallel');
  try { return JSON.parse(fn(data, parseInt(parents), method, parseInt(reps))); } finally { fn.destroy(); }
};
export const runStability = async (py, data, geno, envs, reps) => {
  const fn = py.globals.get('run_stability');
  try { return JSON.parse(fn(data, parseInt(geno), parseInt(envs), parseInt(reps))); } finally { fn.destroy(); }
};
export const runLineTester = async (py, data, lines, testers, reps) => {
  const fn = py.globals.get('run_line_tester');
  try { return JSON.parse(fn(data, parseInt(lines), parseInt(testers), parseInt(reps))); } finally { fn.destroy(); }
};
export const runAugmented = async (py, data, checks, blocks) => {
  const fn = py.globals.get('run_augmented');
  try { return JSON.parse(fn(data, parseInt(checks), parseInt(blocks))); } finally { fn.destroy(); }
};
export const runGenMeans = async (py, data) => {
  const fn = py.globals.get('run_generation_means');
  try { return JSON.parse(fn(data)); } finally { fn.destroy(); }
};
export const runPooledRBD = async (py, data, t, r, e) => {
  const fn = py.globals.get('run_pooled_rbd');
  try { return JSON.parse(fn(data, parseInt(t), parseInt(r), parseInt(e))); } finally { fn.destroy(); }
};
export const runMulComp = async (py, data, t, r, test) => {
  const fn = py.globals.get('run_mulcomp');
  try { return JSON.parse(fn(data, parseInt(t), parseInt(r), test)); } finally { fn.destroy(); }
};
