import './App.css';
import {BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import AdminPage from './components/AdminPage/AdminPage';
import InputBrand from './components/Input/InputBrand';
import InputCar from './components/Input/InputCar';
import AdminLogin from './components/AdminPage/AdminLogin';
import EditBrand from './components/Edit/EditBrand';
import EditCar from './components/Edit/EditCar';
import InputCategory from './components/Input/inputCategory';
import InputProduct from './components/Input/inputProduct';
import Signup from './components/SignupPage/Signup';
import Login from './components/LoginPage/Login';
import User from './components/UserPage/User';
import ContactUs from './components/ContactUs/ContactUs';
import Cart from './components/Cart/Cart';
import InsertInfoOrder from './components/InsertInfoOrder/InsertInfoOrder';
import Payment from './components/Payment/Payment';
import AboutUs from './components/AboutUs/AboutUs';
import EditProduct from './components/Edit/EditProduct';

function App() {
  return (
    <div className="App font-rethink">
      <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<User />} />
            <Route path="/input_brand" element={<InputBrand />} />
            <Route path="/input_cars" element={<InputCar />} />
            <Route path="/loginadmin" element={<AdminLogin />} />
            <Route path="/edit_brand" element={<EditBrand />} />
            <Route path="/edit_car" element={<EditCar />} />
            <Route path="/input_category" element={<InputCategory />} />
            <Route path="/input_product" element={<InputProduct />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/InsertInfoOrder" element={<InsertInfoOrder />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/EditProduct" element={<EditProduct />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
