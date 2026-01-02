import './Setting.css';
import { Link } from "react-router-dom";

import { MdPersonOutline } from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdColorLens } from "react-icons/md";
import { MdOutlineSecurity } from "react-icons/md";
import { MdOutlineContactSupport } from "react-icons/md";
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

function Setting()
{
    return <div className=".activity-layout "><Sidebar/>
    <div className="main-section"><Header/>
    <div className="settings">
     
        <Link className="setting-item"><div className="icon"><MdPersonOutline /></div>
            <div className="text"><h3 className="title">Profile</h3>
            <p className="info">Manage your personal information and preferences</p></div></Link>

        <Link className="setting-item"><div className="icon"><IoIosNotificationsOutline /></div>
            <div className="text"><h3 className="title">Notifications</h3>
            <p className="info">Configure how you receive notifications</p></div></Link>

        <Link className="setting-item"><div className="icon"><MdColorLens/></div>
            <div className="text"><h3 className="title">Apperance</h3>
            <p className="info">Customize the look and feel of the app</p></div></Link>

        <Link className="setting-item"><div className="icon"><MdOutlineSecurity/></div>
            <div className="text"><h3 className="title">Security</h3>
            <p className="info">Manage your password and security settings</p></div></Link>
            
        <Link className="setting-item"><div className="icon"><MdOutlineContactSupport/></div>
            <div className="text"><h3 className="title">Help & Support</h3>
            <p className="info">Get help and contact support</p></div></Link>
    </div></div></div>
}
export default Setting