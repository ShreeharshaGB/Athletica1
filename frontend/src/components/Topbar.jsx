import {
  Search,
  Bell
} from "lucide-react";

function Topbar() {
  return (
    <header className="topbar">

      <div className="search">

        <Search size={16} />

        <input
          type="text"
          placeholder="Search..."
        />

      </div>


      <div className="topbar-right">

        <button className="notification-button">
          <Bell size={18} />
        </button>


        <div className="profile">
          A
        </div>

      </div>

    </header>
  );
}

export default Topbar;