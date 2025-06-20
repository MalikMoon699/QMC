import { Plus } from 'lucide-react';
import React from 'react'

const AboutUs = () => {
  return (
    <div>
      <div className="mobile-summary-header mobiles-summary-header">
        <div className="mobiles-status-title">About Us</div>
        <button
          style={{ background: "rgb(239, 63, 44)" }}
          className="action-btn"
        >
          <Plus /> Update Details
        </button>
      </div>
    </div>
  );
}

export default AboutUs
