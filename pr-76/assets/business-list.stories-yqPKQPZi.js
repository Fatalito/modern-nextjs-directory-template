import{o as w,s as y,u as j,_ as v,j as u,B as O,c as g}from"./business-card-DoM9xLOQ.js";import"./iframe-dCWxxSib.js";import"./preload-helper-PPVm8Dsz.js";const L={name:"Directory"},d={businessList:{discoveryHeading:e=>`Discovery (${e})`,emptyState:{cityAndService:(e,s)=>`No ${e} services in ${s} yet!`,serviceOnly:(e,s)=>`No ${e} services on ${s} yet!`,cityOnly:e=>`No businesses in ${e} yet!`,noFilters:()=>"No businesses match your selection."}}};function E(e,s){if(e instanceof Promise)throw new Error(s)}function D(e,s){const r={},c=[];for(const n in e){const i=e[n]["~standard"].validate(s[n]);if(E(i,`Validation must be synchronous, but ${n} returned a Promise.`),i.issues){c.push(...i.issues.map(a=>({...a,message:a.message,path:[n,...a.path??[]]})));continue}r[n]=i.value}return c.length?{issues:c}:{value:r}}var U={};function I(e){const s=e.runtimeEnvStrict??e.runtimeEnv??U;if(e.emptyStringAsUndefined??!1)for(const[t,o]of Object.entries(s))o===""&&delete s[t];if(e.skipValidation){if(e.extends)for(const t of e.extends)t.skipValidation=!0;return s}const r=typeof e.client=="object"?e.client:{},c=typeof e.server=="object"?e.server:{},n=typeof e.shared=="object"?e.shared:{},i=e.isServer??(typeof window>"u"||"Deno"in window),a=i?{...c,...n,...r}:{...r,...n},l=e.createFinalSchema?.(a,i)?.["~standard"].validate(s)??D(a,s);E(l,"Validation must be synchronous");const _=e.onValidationError??(t=>{throw console.error("❌ Invalid environment variables:",t),new Error("Invalid environment variables")}),b=e.onInvalidAccess??(()=>{throw new Error("❌ Attempted to access a server-side environment variable on the client")});if(l.issues)return _(l.issues);const A=t=>e.clientPrefix?!t.startsWith(e.clientPrefix)&&!(t in n):!0,x=t=>i||!A(t),T=t=>t==="__esModule"||t==="$$typeof",B=(e.extends??[]).reduce((t,o)=>Object.assign(t,o),{}),N=Object.assign(B,l.value);return new Proxy(N,{get(t,o){if(typeof o=="string"&&!T(o))return x(o)?Reflect.get(t,o):b(o)}})}var P={};const V="NEXT_PUBLIC_";function $(e){const s=typeof e.client=="object"?e.client:{},r=typeof e.server=="object"?e.server:{},c=e.shared,n=e.runtimeEnv?e.runtimeEnv:{...P,...e.experimental__runtimeEnv};return I({...e,shared:c,client:s,server:r,clientPrefix:V,runtimeEnv:n})}var m={};const M=w({ENABLE_HSTS:y().default("false").transform(e=>e.trim().toLowerCase()==="true"),NODE_ENV:v(["development","test","production"]).default("development"),NEXT_OUTPUT_MODE:v(["serverless","static","standalone"]).default("serverless"),DATABASE_URL:j().optional(),DATABASE_AUTH_TOKEN:y().optional()});$({server:M.shape,client:{},runtimeEnv:{NODE_ENV:"production",ENABLE_HSTS:m.ENABLE_HSTS,NEXT_OUTPUT_MODE:m.NEXT_OUTPUT_MODE,DATABASE_URL:m.DATABASE_URL,DATABASE_AUTH_TOKEN:m.DATABASE_AUTH_TOKEN},skipValidation:!!m.SKIP_ENV_VALIDATION,emptyStringAsUndefined:!0});function S({businesses:e,cityName:s,serviceName:r}){const n=r&&s?d.businessList.emptyState.cityAndService(r,s):r?d.businessList.emptyState.serviceOnly(r,L.name):s?d.businessList.emptyState.cityOnly(s):d.businessList.emptyState.noFilters(),i=e.length>0;return u.jsxs("section",{className:"space-y-6",children:[u.jsx("header",{className:"flex flex-col gap-4 md:flex-row md:items-center md:justify-between",children:u.jsx("h2",{className:"text-2xl font-bold tracking-tight text-balance",children:d.businessList.discoveryHeading(e.length)})}),i?u.jsx("div",{className:"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:e.map((a,l)=>u.jsx(O,{business:a,priority:l<2},a.id))}):u.jsx("div",{className:"flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl",children:u.jsx("p",{className:"text-slate-500 text-pretty",children:n})})]})}S.__docgenInfo={description:`BusinessList displays a grid of business cards with contextual empty states.
Shows business count in header and adapts empty message based on active filters.

@param businesses - Array of businesses to display
@param cityName - Name of filtered city for contextual messaging (optional)
@param serviceName - Name of filtered service for contextual messaging (optional)
@returns Business card grid or contextual empty state`,methods:[],displayName:"BusinessList",props:{businesses:{required:!0,tsType:{name:"Array",elements:[{name:"Business"}],raw:"Business[]"},description:""},cityName:{required:!1,tsType:{name:"string"},description:""},serviceName:{required:!1,tsType:{name:"string"},description:""}}};const k={component:S,title:"Widgets/BusinessList"},p={args:{businesses:[g({name:"Acme Coffee Shop",category:"hospitality",images:["https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=600&fit=crop"]}),g({name:"Tech Solutions Inc",category:"tech",images:["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop"]}),g({name:"Fitness Studio",category:"health",images:["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop"]})]}},f={args:{businesses:[g({name:"Solo Shop",category:"retail",images:["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop"]})]}},h={args:{businesses:[]}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    businesses: [createBusiness({
      name: "Acme Coffee Shop",
      category: "hospitality",
      images: ["https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=600&fit=crop"]
    }), createBusiness({
      name: "Tech Solutions Inc",
      category: "tech",
      images: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop"]
    }), createBusiness({
      name: "Fitness Studio",
      category: "health",
      images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop"]
    })]
  }
}`,...p.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    businesses: [createBusiness({
      name: "Solo Shop",
      category: "retail",
      images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop"]
    })]
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    businesses: []
  }
}`,...h.parameters?.docs?.source}}};const F=["WithMultipleBusinesses","SingleBusiness","EmptyState"];export{h as EmptyState,f as SingleBusiness,p as WithMultipleBusinesses,F as __namedExportsOrder,k as default};
