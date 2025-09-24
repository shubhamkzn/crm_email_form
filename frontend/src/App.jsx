import React from "react";
import { Routes, Route } from "react-router"; // Remove Router import
import Signup from "./components/pages/Signup.jsx";
import Login from "./components/pages/Login.jsx";
import Home from "./components/pages/Home.jsx"
import Dashboard from "./components/pages/Dashboard.jsx";
import MultiAuth from "./components/pages/MultiAuth.jsx";
import Email from "./components/pages/Email.jsx";
import SeeData from "./components/pages/SeeData.jsx";
import History from "./components/pages/History.jsx";
import EmailTemplateSystem from './components/pages/EmailTemplateSystem';
import ExistingTemplates from './components/pages/ExistingTemplates';
import BuildTemplates from './components/pages/BuildTemplates';
import Editor from './components/pages/Editor';
import AllTemplates from "./components/pages/AllTemplates.jsx";
import EmailBuilder from "./test/EmailBuilder.jsx";
//     ..............................................................
import HomeForms from './components/formIo/home/Home.jsx';
import CreateForm from './components/formIo/CreateForm/CreateForm.jsx';
import ViewForm from './components/formIo/ViewForm/ViewForm.jsx';
import EditForm from './components/formIo/EditForm/EditForm.jsx';
import Layout from './components/Layout.jsx';
import DisplayForm from './components/formIo/DisplayForm/DisplayForm.jsx';
import "bootstrap/dist/css/bootstrap.min.css";
import "formiojs/dist/formio.full.min.css";
import SeeAllData from "./components/pages/SeeAllData.jsx";
import Lead from "./components/leads/Leads.jsx";
const App = () => {
  return (
    <Routes >
      {/* Public Pages */}
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />} /> 
        {/* <Route path="/dashboard" element={<Dashboard />} />  */}
        {/* <Route path="/2fa" element={<MultiAuth />} /> */}
        
       <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seeData" element={<SeeAllData />} />
        <Route path="/history" element={<History />} />
        <Route path="/templates" element={<EmailTemplateSystem />} />
        <Route path="/templates/build" element={<BuildTemplates />} />
        <Route path="/templates/existing" element={<AllTemplates />} />
        <Route path="/test" element={<EmailBuilder/>} />
        <Route path="/leads" element={<Lead/>} />

        
        {/* <Route path="/seeAllData" element={<SeeAllData/>} /> */}

      </Route>
        <Route path="/templates/editor/:templateId?" element={<Editor />} />
      
      {/* Form Management Pages (wrapped in Layout) */}
        <Route path="/forms" element={<Layout />}>
          <Route index element={<CreateForm />} /> 
          <Route path="list" element={<HomeForms />} /> 
          <Route path=":id" element={<ViewForm />} /> 
          <Route path="edit/:id" element={<EditForm />} />
        </Route>

      
        {/* Display Form page outside layout */}
        <Route path="/form/:id" element={<DisplayForm />} />



    </Routes>
  );
};

export default App;
