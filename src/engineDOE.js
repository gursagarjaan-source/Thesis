// DOE Python scripts for Pyodide
export const doePython = `
def run_two_factor(data_str, fa, fb, reps):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    a,b,r = int(fa),int(fb),int(reps)
    if len(vals)!=a*b*r: raise ValueError(f"Need {a*b*r} values, got {len(vals)}")
    data = vals.reshape((r,a,b))
    G=np.sum(data); N=a*b*r; CF=G**2/N
    TSS=np.sum(data**2)-CF
    rep_t=np.sum(data,axis=(1,2)); RSS=np.sum(rep_t**2)/(a*b)-CF
    a_t=np.sum(data,axis=(0,2)); ASS=np.sum(a_t**2)/(b*r)-CF
    b_t=np.sum(data,axis=(0,1)); BSS=np.sum(b_t**2)/(a*r)-CF
    ab_t=np.sum(data,axis=0); ABSS=np.sum(ab_t**2)/r-CF-ASS-BSS
    ra_t=np.sum(data,axis=2); EASS=np.sum(ra_t**2)/b-CF-RSS-ASS
    EBSS=TSS-RSS-ASS-EASS-BSS-ABSS-0
    df_t=N-1; df_r=r-1; df_a=a-1; df_ea=(r-1)*(a-1); df_b=b-1; df_ab=(a-1)*(b-1)
    df_eb=a*(r-1)*(b-1)
    ms_a=ASS/df_a if df_a>0 else 0; ms_ea=EASS/df_ea if df_ea>0 else 0
    ms_b=BSS/df_b if df_b>0 else 0; ms_ab=ABSS/df_ab if df_ab>0 else 0
    ms_eb=EBSS/df_eb if df_eb>0 else 1e-10
    f_a=ms_a/ms_ea if ms_ea>0 else 0; f_b=ms_b/ms_eb; f_ab=ms_ab/ms_eb
    p_a=1-stats.f.cdf(f_a,df_a,df_ea) if df_ea>0 else None
    p_b=1-stats.f.cdf(f_b,df_b,df_eb) if df_eb>0 else None
    p_ab=1-stats.f.cdf(f_ab,df_ab,df_eb) if df_eb>0 else None
    anova=[
      {"source":"Replication","df":int(df_r),"ss":float(RSS),"ms":float(RSS/df_r) if df_r>0 else None,"f":None,"p":None},
      {"source":"Factor A","df":int(df_a),"ss":float(ASS),"ms":float(ms_a),"f":float(f_a),"p":float(p_a) if p_a else None},
      {"source":"Error (a)","df":int(df_ea),"ss":float(EASS),"ms":float(ms_ea),"f":None,"p":None},
      {"source":"Factor B","df":int(df_b),"ss":float(BSS),"ms":float(ms_b),"f":float(f_b),"p":float(p_b) if p_b else None},
      {"source":"A x B","df":int(df_ab),"ss":float(ABSS),"ms":float(ms_ab),"f":float(f_ab),"p":float(p_ab) if p_ab else None},
      {"source":"Error (b)","df":int(df_eb),"ss":float(EBSS),"ms":float(ms_eb),"f":None,"p":None},
      {"source":"Total","df":int(df_t),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N
    means_a=[{"label":f"A{i+1}","mean":float(a_t[i]/(b*r)),"se":float(np.sqrt(ms_ea/(b*r)))} for i in range(a)]
    means_b=[{"label":f"B{j+1}","mean":float(b_t[j]/(a*r)),"se":float(np.sqrt(ms_eb/(a*r)))} for j in range(b)]
    se_a=float(np.sqrt(ms_ea/(b*r))); se_b=float(np.sqrt(ms_eb/(a*r)))
    se_ab=float(np.sqrt(ms_eb/r))
    t5a=stats.t.ppf(0.975,df_ea); t5b=stats.t.ppf(0.975,df_eb)
    cd_a=float(np.sqrt(2*ms_ea/(b*r))*t5a); cd_b=float(np.sqrt(2*ms_eb/(a*r))*t5b)
    cd_ab=float(np.sqrt(2*ms_eb/r)*t5b)
    cv=float((np.sqrt(ms_eb)/gm)*100)
    return json.dumps({"anova":anova,"means":means_a,"means_b":means_b,"SE_a":se_a,"SE_b":se_b,"SE_ab":se_ab,"CD_a":cd_a,"CD_b":cd_b,"CD_ab":cd_ab,"CV":cv,"grand_mean":float(gm),"SE_m":se_b,"SE_d":float(np.sqrt(2*ms_eb/(a*r))),"CD_5":cd_b})

def run_latin_square(data_str, size):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    n=int(size); N=n*n
    if len(vals)!=N: raise ValueError(f"Need {N} values for {n}x{n} Latin Square, got {len(vals)}")
    data=vals.reshape((n,n))
    G=np.sum(data); CF=G**2/N; TSS=np.sum(data**2)-CF
    row_t=np.sum(data,axis=1); RowSS=np.sum(row_t**2)/n-CF
    col_t=np.sum(data,axis=0); ColSS=np.sum(col_t**2)/n-CF
    TrSS=RowSS; ESS=TSS-RowSS-ColSS-TrSS
    if ESS<0: TrSS=0; ESS=TSS-RowSS-ColSS
    df_r=n-1; df_c=n-1; df_tr=n-1; df_e=(n-1)*(n-2); df_t=N-1
    ms_r=RowSS/df_r; ms_c=ColSS/df_c; ms_tr=TrSS/df_tr if df_tr>0 else 0
    ms_e=ESS/df_e if df_e>0 else 1e-10
    f_r=ms_r/ms_e; f_c=ms_c/ms_e; f_tr=ms_tr/ms_e
    p_r=1-stats.f.cdf(f_r,df_r,df_e); p_c=1-stats.f.cdf(f_c,df_c,df_e)
    p_tr=1-stats.f.cdf(f_tr,df_tr,df_e)
    anova=[
      {"source":"Row","df":int(df_r),"ss":float(RowSS),"ms":float(ms_r),"f":float(f_r),"p":float(p_r)},
      {"source":"Column","df":int(df_c),"ss":float(ColSS),"ms":float(ms_c),"f":float(f_c),"p":float(p_c)},
      {"source":"Treatment","df":int(df_tr),"ss":float(TrSS),"ms":float(ms_tr),"f":float(f_tr),"p":float(p_tr)},
      {"source":"Error","df":int(df_e),"ss":float(ESS),"ms":float(ms_e),"f":None,"p":None},
      {"source":"Total","df":int(df_t),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N; se_m=float(np.sqrt(ms_e/n)); se_d=float(np.sqrt(2*ms_e/n))
    t5=stats.t.ppf(0.975,df_e); cd5=se_d*t5; cv=float((np.sqrt(ms_e)/gm)*100)
    means=[{"label":f"R{i+1}","mean":float(row_t[i]/n),"se":se_m} for i in range(n)]
    return json.dumps({"anova":anova,"means":means,"SE_m":se_m,"SE_d":se_d,"CD_5":float(cd5),"CV":cv,"grand_mean":float(gm)})

def run_strip_plot(data_str, f1, f2, reps):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    h,v,r=int(f1),int(f2),int(reps); N=h*v*r
    if len(vals)!=N: raise ValueError(f"Need {N} values, got {len(vals)}")
    data=vals.reshape((r,h,v))
    G=np.sum(data); CF=G**2/N; TSS=np.sum(data**2)-CF
    rep_t=np.sum(data,axis=(1,2)); RSS=np.sum(rep_t**2)/(h*v)-CF
    h_t=np.sum(data,axis=(0,2)); HSS=np.sum(h_t**2)/(v*r)-CF
    v_t=np.sum(data,axis=(0,1)); VSS=np.sum(v_t**2)/(h*r)-CF
    rh_t=np.sum(data,axis=2); EHSS=np.sum(rh_t**2)/v-CF-RSS-HSS
    rv_t=np.sum(data,axis=1); EVSS=np.sum(rv_t**2)/h-CF-RSS-VSS
    hv_t=np.sum(data,axis=0); HVSS=np.sum(hv_t**2)/r-CF-HSS-VSS
    EHVSS=TSS-RSS-HSS-EHSS-VSS-EVSS-HVSS
    df_r=r-1; df_h=h-1; df_eh=(r-1)*(h-1); df_v=v-1; df_ev=(r-1)*(v-1)
    df_hv=(h-1)*(v-1); df_ehv=(r-1)*(h-1)*(v-1); df_t=N-1
    ms_h=HSS/df_h; ms_eh=EHSS/df_eh if df_eh>0 else 1e-10
    ms_v=VSS/df_v; ms_ev=EVSS/df_ev if df_ev>0 else 1e-10
    ms_hv=HVSS/df_hv if df_hv>0 else 0; ms_ehv=EHVSS/df_ehv if df_ehv>0 else 1e-10
    f_h=ms_h/ms_eh; f_v=ms_v/ms_ev; f_hv=ms_hv/ms_ehv
    p_h=1-stats.f.cdf(f_h,df_h,df_eh); p_v=1-stats.f.cdf(f_v,df_v,df_ev)
    p_hv=1-stats.f.cdf(f_hv,df_hv,df_ehv)
    anova=[
      {"source":"Replication","df":int(df_r),"ss":float(RSS),"ms":float(RSS/df_r),"f":None,"p":None},
      {"source":"H-Factor","df":int(df_h),"ss":float(HSS),"ms":float(ms_h),"f":float(f_h),"p":float(p_h)},
      {"source":"Error (H)","df":int(df_eh),"ss":float(EHSS),"ms":float(ms_eh),"f":None,"p":None},
      {"source":"V-Factor","df":int(df_v),"ss":float(VSS),"ms":float(ms_v),"f":float(f_v),"p":float(p_v)},
      {"source":"Error (V)","df":int(df_ev),"ss":float(EVSS),"ms":float(ms_ev),"f":None,"p":None},
      {"source":"H x V","df":int(df_hv),"ss":float(HVSS),"ms":float(ms_hv),"f":float(f_hv),"p":float(p_hv)},
      {"source":"Error (HxV)","df":int(df_ehv),"ss":float(EHVSS),"ms":float(ms_ehv),"f":None,"p":None},
      {"source":"Total","df":int(df_t),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N; se_m=float(np.sqrt(ms_ehv/(h*r))); se_d=float(np.sqrt(2*ms_ehv/(h*r)))
    t5=stats.t.ppf(0.975,df_ehv); cd5=se_d*t5; cv=float((np.sqrt(ms_ehv)/gm)*100)
    means=[{"label":f"H{i+1}","mean":float(h_t[i]/(v*r)),"se":float(np.sqrt(ms_eh/(v*r)))} for i in range(h)]
    return json.dumps({"anova":anova,"means":means,"SE_m":se_m,"SE_d":se_d,"CD_5":float(cd5),"CV":cv,"grand_mean":float(gm)})

def generate_layout(design, treatments, replications):
    import json, numpy as np
    t=int(treatments); r=int(replications)
    layout=[]
    for i in range(r):
        perm=np.random.permutation(t)+1
        layout.append(perm.tolist())
    return json.dumps({"layout":layout,"design":design,"treatments":t,"replications":r})

def run_three_factor(data_str, fa, fb, fc, reps):
    import json, numpy as np, scipy.stats as stats
    raw = data_str.replace('\\t',' ').replace('\\r',' ').replace('\\n',' ')
    vals = np.array([float(x) for x in raw.split() if x.strip()])
    a,b,c,r=int(fa),int(fb),int(fc),int(reps); N=a*b*c*r
    if len(vals)!=N: raise ValueError(f"Need {N} values, got {len(vals)}")
    data=vals.reshape((r,a,b,c))
    G=np.sum(data); CF=G**2/N; TSS=np.sum(data**2)-CF
    rep_t=np.sum(data,axis=(1,2,3)); RSS=np.sum(rep_t**2)/(a*b*c)-CF
    a_t=np.sum(data,axis=(0,2,3)); ASS=np.sum(a_t**2)/(b*c*r)-CF
    b_t=np.sum(data,axis=(0,1,3)); BSS=np.sum(b_t**2)/(a*c*r)-CF
    c_t=np.sum(data,axis=(0,1,2)); CSS_=np.sum(c_t**2)/(a*b*r)-CF
    ab_t=np.sum(data,axis=(0,3)); ABSS=np.sum(ab_t**2)/(c*r)-CF-ASS-BSS
    ac_t=np.sum(data,axis=(0,2)); ACSS=np.sum(ac_t**2)/(b*r)-CF-ASS-CSS_
    bc_t=np.sum(data,axis=(0,1)); BCSS=np.sum(bc_t**2)/(a*r)-CF-BSS-CSS_
    abc_t=np.sum(data,axis=0); ABCSS=np.sum(abc_t**2)/r-CF-ASS-BSS-CSS_-ABSS-ACSS-BCSS
    ra_t=np.sum(data,axis=(2,3)); EA=np.sum(ra_t**2)/(b*c)-CF-RSS-ASS
    ESS=TSS-RSS-ASS-EA-BSS-ABSS-CSS_-ACSS-BCSS-ABCSS
    df_t=N-1; df_r=r-1; df_a=a-1; df_ea=(r-1)*(a-1); df_b=b-1; df_ab=(a-1)*(b-1)
    df_c=c-1; df_ac=(a-1)*(c-1); df_bc=(b-1)*(c-1); df_abc=(a-1)*(b-1)*(c-1)
    df_e=df_t-df_r-df_a-df_ea-df_b-df_ab-df_c-df_ac-df_bc-df_abc
    ms_e=ESS/df_e if df_e>0 else 1e-10; ms_ea=EA/df_ea if df_ea>0 else 1e-10
    ms_a=ASS/df_a; ms_b=BSS/df_b; ms_c=CSS_/df_c
    ms_ab=ABSS/df_ab if df_ab>0 else 0; ms_ac=ACSS/df_ac if df_ac>0 else 0
    ms_bc=BCSS/df_bc if df_bc>0 else 0; ms_abc=ABCSS/df_abc if df_abc>0 else 0
    f_a=ms_a/ms_ea; f_b=ms_b/ms_e; f_c=ms_c/ms_e
    f_ab=ms_ab/ms_e; f_ac=ms_ac/ms_e; f_bc=ms_bc/ms_e; f_abc=ms_abc/ms_e
    def pv(f,d1,d2): return float(1-stats.f.cdf(f,d1,d2)) if d2>0 else None
    anova=[
      {"source":"Replication","df":int(df_r),"ss":float(RSS),"ms":float(RSS/df_r),"f":None,"p":None},
      {"source":"Factor A","df":int(df_a),"ss":float(ASS),"ms":float(ms_a),"f":float(f_a),"p":pv(f_a,df_a,df_ea)},
      {"source":"Error (a)","df":int(df_ea),"ss":float(EA),"ms":float(ms_ea),"f":None,"p":None},
      {"source":"Factor B","df":int(df_b),"ss":float(BSS),"ms":float(ms_b),"f":float(f_b),"p":pv(f_b,df_b,df_e)},
      {"source":"A x B","df":int(df_ab),"ss":float(ABSS),"ms":float(ms_ab),"f":float(f_ab),"p":pv(f_ab,df_ab,df_e)},
      {"source":"Factor C","df":int(df_c),"ss":float(CSS_),"ms":float(ms_c),"f":float(f_c),"p":pv(f_c,df_c,df_e)},
      {"source":"A x C","df":int(df_ac),"ss":float(ACSS),"ms":float(ms_ac),"f":float(f_ac),"p":pv(f_ac,df_ac,df_e)},
      {"source":"B x C","df":int(df_bc),"ss":float(BCSS),"ms":float(ms_bc),"f":float(f_bc),"p":pv(f_bc,df_bc,df_e)},
      {"source":"A x B x C","df":int(df_abc),"ss":float(ABCSS),"ms":float(ms_abc),"f":float(f_abc),"p":pv(f_abc,df_abc,df_e)},
      {"source":"Error","df":int(df_e),"ss":float(ESS),"ms":float(ms_e),"f":None,"p":None},
      {"source":"Total","df":int(df_t),"ss":float(TSS),"ms":None,"f":None,"p":None}
    ]
    gm=G/N; se_m=float(np.sqrt(ms_e/(a*r))); se_d=float(np.sqrt(2*ms_e/(a*r)))
    t5=stats.t.ppf(0.975,df_e); cd5=se_d*t5; cv=float((np.sqrt(ms_e)/gm)*100)
    means=[{"label":f"A{i+1}","mean":float(a_t[i]/(b*c*r)),"se":se_m} for i in range(a)]
    return json.dumps({"anova":anova,"means":means,"SE_m":se_m,"SE_d":se_d,"CD_5":float(cd5),"CV":cv,"grand_mean":float(gm)})
`;

export const runTwoFactor = async (pyodide, data, fa, fb, reps) => {
  const fn = pyodide.globals.get('run_two_factor');
  try { return JSON.parse(fn(data, parseInt(fa), parseInt(fb), parseInt(reps))); }
  finally { fn.destroy(); }
};

export const runLatinSquare = async (pyodide, data, size) => {
  const fn = pyodide.globals.get('run_latin_square');
  try { return JSON.parse(fn(data, parseInt(size))); }
  finally { fn.destroy(); }
};

export const runStripPlot = async (pyodide, data, f1, f2, reps) => {
  const fn = pyodide.globals.get('run_strip_plot');
  try { return JSON.parse(fn(data, parseInt(f1), parseInt(f2), parseInt(reps))); }
  finally { fn.destroy(); }
};

export const runLayout = async (pyodide, design, treatments, reps) => {
  const fn = pyodide.globals.get('generate_layout');
  try { return JSON.parse(fn(design, parseInt(treatments), parseInt(reps))); }
  finally { fn.destroy(); }
};

export const runThreeFactor = async (pyodide, data, fa, fb, fc, reps) => {
  const fn = pyodide.globals.get('run_three_factor');
  try { return JSON.parse(fn(data, parseInt(fa), parseInt(fb), parseInt(fc), parseInt(reps))); }
  finally { fn.destroy(); }
};
