import{r as w,m as _,j as e,L as C,$ as N}from"./app-Bwz9molf.js";import{I as n}from"./InputError-BJEa38Ri.js";import{e as j,G as I,B as c,a as L,b,c as k,d as D,L as o,I as g,S as M,f as E,g as G,h as V,i as A,j as P,k as T,l as $,P as F,m as B,n as H,o as q,p as R,q as W,u as p}from"./GuestLayout-BhKH_MVm.js";import"./index-N5Ghf6h1.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],J=j("Calendar",z);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]],O=j("LogIn",K);function te({auth:Q,laravelVersion:U,phpVersion:X,categories:x,message:Y}){const[f,u]=w.useState(""),{data:a,setData:r,errors:l,post:y,reset:v,processing:m}=_({title:"",category_id:void 0,amount:void 0,expense_date:new Date}),i=new Date;i.setHours(0,0,0,0);const S=s=>{s.preventDefault();const d={...a,expense_date:W(a.expense_date,"yyyy-MM-dd")};console.log(d),y(route("expense.public-store"),{preserveScroll:!0,onSuccess:t=>{var h;v(),u(""),r("category_id",void 0),console.log(t),p.success(String((h=t.props)==null?void 0:h.message)||"Gasto guardado exitosamente")},onError:t=>{console.error("Error al guardar el gasto",t),p.error("Error al guardar el gasto")}})};return e.jsxs(I,{children:[e.jsx(C,{title:"SrGastos"}),e.jsxs("div",{className:"flex flex-col items-center justify-center h-screen w-full p-8 md:px-16",children:[e.jsxs("header",{className:"flex w-full justify-between items-center",children:[e.jsx("div",{}),e.jsx("img",{src:"assets/images/sr-connor.svg",alt:"Logo",width:180}),e.jsx("div",{children:e.jsx(N,{href:"/login",children:e.jsxs(c,{variant:"outline",children:["Login ",e.jsx(O,{})]})})})]}),e.jsx("main",{className:"flex flex-col items-center justify-center h-full w-full md:w-2/4",children:e.jsxs(L,{className:"w-full md:max-w-[600px]",children:[e.jsx(b,{children:e.jsx(k,{children:"Agregar Gasto"})}),e.jsx(D,{children:e.jsxs("form",{className:"w-full space-y-6",onSubmit:S,children:[e.jsxs("div",{children:[e.jsx(o,{children:"Titulo"}),e.jsx(g,{value:a.title,placeholder:"Ingrese el titulo",onChange:s=>r("title",s.target.value)}),e.jsx(n,{message:l.title})]}),e.jsxs("div",{children:[e.jsx(o,{children:"Categoria"}),e.jsxs(M,{onValueChange:s=>{r("category_id",Number(s))},defaultValue:a.category_id?String(a.category_id):"",children:[e.jsx(E,{className:"w-full",children:e.jsx(G,{placeholder:"Seleccionar Categoria"})}),e.jsx(V,{className:"w-full",children:e.jsxs(A,{children:[e.jsx(P,{children:"Categoria"}),x.length>0&&x.map(s=>e.jsx(T,{value:String(s.id),children:s.name},s.id))]})})]}),e.jsx(n,{message:l.category_id})]}),e.jsxs("div",{children:[e.jsx(o,{children:"Valor"}),e.jsx(g,{type:"text",placeholder:"Ingrese el monto",value:f,onChange:s=>{const{formatted:d,raw:t}=$(s.target.value);u(d),r("amount",t)}}),e.jsx(n,{message:l.amount})]}),e.jsxs("div",{children:[e.jsx(o,{children:"Fecha"}),e.jsxs(F,{children:[e.jsx(B,{asChild:!0,children:e.jsxs(c,{variant:"outline",className:H("w-full pl-3 text-left font-normal",!a.expense_date&&"text-muted-foreground"),children:[a.expense_date?a.expense_date.toLocaleDateString():e.jsx("span",{children:"Pick a date"}),e.jsx(J,{className:"ml-auto h-4 w-4 opacity-50"})]})}),e.jsx(q,{className:"w-auto p-0",align:"start",children:e.jsx(R,{mode:"single",selected:a.expense_date,onSelect:s=>{s&&r("expense_date",s)},disabled:s=>s>i||s<new Date("1900-01-01"),defaultMonth:i,initialFocus:!0})})]}),e.jsx(n,{message:l.expense_date})]}),e.jsx(c,{disabled:m,children:m?"Agregando...":"Agregar gasto"})]})})]})})]})]})}export{te as default};
