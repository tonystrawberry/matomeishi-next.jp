import React from 'react';
import { Button } from "./ui/button";

const Header: React.FC = () => {
    return (
        <header className=" p-4 text-white flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-black rounded-full"></div>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary">Add Business Card</Button>

              {/* Logout Button */}
              <Button>Logout</Button>
            </div>
        </header>
    );
}

export default Header;
