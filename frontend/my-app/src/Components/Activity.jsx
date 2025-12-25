import './Activity.css';
import Sidebar from './Sidebar';
import Header from './Header';  



function Activity() {
    const activities =[
    {
        id:1,
        username:"JohnDoe",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
        type:"completed",
        action:"Moved to Done",
        task:"Homepage hero section",
        time:"Jan 15, 2024 10:30 AM"
    },
    {
        id:2,
        username:"Jane Smith",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
        type:"assigned",
        action:"Assigned to Alice",
        task:"Analytics dashboard",
        time:"Jan 13, 2024 10:30 AM"
    },
    {
        id:3,
        username:"Mike Brown",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
        type:"updated",
        action:"Priority changed to High",
        task:"Api integration",
        time:"Jan 20, 2024 10:30 AM"
    },
    {
        id:4,
        username:"Alice",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
        type:"created",
        action:"Task created",
        task:"System design documentation",
        time:"Jan 5, 2024 10:30 AM"
    },
{
  id: 5,
  username: "Robert King",
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
  type: "updated",
  action: "Status changed to In Progress",
  task: "Payment gateway integration",
  time: "Jan 7, 2024 11:15 AM"
},
{
  id: 6,
  username: "Emily Davis",
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
  type: "assigned",
  action: "Assigned to JohnDoe",
  task: "UI bug fixes",
  time: "Jan 8, 2024 02:45 PM"
},
{
  id: 7,
  username: "Daniel Moore",
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
  type: "completed",
  action: "Moved to Done",
  task: "Login page redesign",
  time: "Jan 9, 2024 05:20 PM"
},
{
  id: 8,
  username: "Sophia Wilson",
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
  type: "created",
  action: "Task created",
  task: "Notification system setup",
  time: "Jan 10, 2024 10:00 AM"
},
{
  id: 9,
  username: "Michael Scott",
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s",
  type: "updated",
  action: "Priority changed to Medium",
  task: "API performance optimization",
  time: "Jan 11, 2024 03:40 PM"
}

];

const activityIcon = (type) => {
if(type === "completed") return "✅";
if(type === "assigned") return "👤"
if(type === "updated") return "✏️"
if(type === "created") return "🆕";
}
  return (
  <div className="activity-layout">
    <Sidebar />
    
<div className="main-section"><Header />
    <div className="activities">
        
      {activities.map((activity) => (
        <div key={activity.id} className="activity-card">
          <div className="activity-type">
            {activityIcon(activity.type)}
          </div>

          <div className="activity-details">
            <div className="activity-img">
              <img
                src={activity.image}
                alt={activity.username}
                className="activity-user-image"
              />
            </div>

            <div className="activity_details">
              <p className="activity-user-name">
                {activity.username}{" "}
                <span className="activity-action">{activity.type}</span>{" "}
                <span className="activity-task">{activity.task}</span>
              </p>
              <p className="activity-action">{activity.action}</p>
            </div>

            <div className="activity-time">{activity.time}</div>
          </div>
        </div>
      ))}
    </div>
  </div></div>
);

}
export default Activity;