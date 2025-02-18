import{j as e,m as p,L as h,$ as n}from"./app-O6ClL6Ku.js";import{I as m}from"./InputError-BwDH32Se.js";import{I as i}from"./InputLabel-DZEJevQL.js";import{B as d,C as j,a as b,b as w,c as v,d as y,I as c}from"./popover-CtRjf3t3.js";import{G as N}from"./GuestLayout-DYAkIp0r.js";import"./index-wyzLC8nf.js";function k({className:a="",...r}){return e.jsx("input",{...r,type:"checkbox",className:"rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800 "+a})}function D({status:a,canResetPassword:r}){const{data:t,setData:o,post:x,processing:u,errors:l,reset:g}=p({email:"",password:"",remember:!1}),f=s=>{s.preventDefault(),x(route("login"),{onFinish:()=>g("password")})};return e.jsxs(N,{children:[e.jsx(h,{title:"Log in"}),a&&e.jsx("div",{className:"mb-4 text-sm font-medium text-green-600",children:a}),e.jsxs("div",{className:"flex flex-col items-center justify-center h-screen w-full p-8 md:px-16",children:[e.jsx(n,{href:"/",children:e.jsxs(d,{variant:"outline",className:"absolute top-4 left-4",children:[e.jsx(j,{})," Regresar"]})}),e.jsx("img",{src:"assets/images/sr-connor.svg",alt:"Logo",width:200,className:"mx-auto mb-4"}),e.jsxs(b,{className:"w-full md:max-w-[600px]",children:[e.jsx(w,{children:e.jsx(v,{children:"Iniciar Sesión"})}),e.jsx(y,{children:e.jsxs("form",{onSubmit:f,className:"w-full space-y-6",children:[e.jsxs("div",{children:[e.jsx(i,{htmlFor:"email",value:"Correo electrónico"}),e.jsx(c,{id:"email",type:"email",name:"email",value:t.email,className:"mt-1 block w-full",autoComplete:"username",onChange:s=>o("email",s.target.value)}),e.jsx(m,{message:l.email,className:"mt-2"})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx(i,{htmlFor:"password",value:"Contraseña"}),e.jsx(c,{id:"password",type:"password",name:"password",value:t.password,className:"mt-1 block w-full",autoComplete:"current-password",onChange:s=>o("password",s.target.value)}),e.jsx(m,{message:l.password,className:"mt-2"})]}),e.jsx("div",{className:"mt-4 block",children:e.jsxs("label",{className:"flex items-center",children:[e.jsx(k,{name:"remember",checked:t.remember,onChange:s=>o("remember",s.target.checked||!1)}),e.jsx("span",{className:"ms-2 text-sm text-gray-600 dark:text-gray-400",children:"Recordarme"})]})}),e.jsxs("div",{className:"mt-4 flex items-center justify-end",children:[r&&e.jsx(n,{href:route("password.request"),className:"rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800",children:"Forgot your password?"}),e.jsx(d,{className:"ms-4",disabled:u,children:"Ingresar"})]})]})})]})]})]})}export{D as default};
