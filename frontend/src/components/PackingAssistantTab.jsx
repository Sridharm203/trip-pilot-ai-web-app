import React, { useState } from 'react';
import { FaSuitcase, FaCheckSquare, FaSquare, FaMedkit, FaFileAlt, FaTshirt, FaTv } from 'react-icons/fa';
import api from '../services/api';

const PackingAssistantTab = ({ trip, readOnly = false }) => {
  const [packingList, setPackingList] = useState(trip.packing_list || []);
  const [updating, setUpdating] = useState(false);

  // Group items by category
  const categories = ["Clothes", "Documents", "Medicines", "Electronics"];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Clothes': return <FaTshirt className="text-primary" />;
      case 'Documents': return <FaFileAlt className="text-warning" />;
      case 'Medicines': return <FaMedkit className="text-danger" />;
      case 'Electronics': return <FaTv className="text-info" />;
      default: return <FaSuitcase />;
    }
  };

  const handleTogglePacked = async (itemId) => {
    if (readOnly || updating) return;

    const updatedList = packingList.map((item) => {
      if (item.id === itemId) {
        return { ...item, packed: !item.packed };
      }
      return item;
    });

    setPackingList(updatedList);
    setUpdating(true);

    try {
      // Sync checklist back to backend PATCH endpoint
      await api.patch(`trips/${trip.id}/packing-update/`, {
        packing_list: updatedList,
      });
    } catch (err) {
      console.error("Failed to sync packing status:", err);
      // Revert state if failed
      setPackingList(packingList);
    } finally {
      setUpdating(false);
    }
  };

  // Progress metrics
  const totalItems = packingList.length;
  const packedItems = packingList.filter(item => item.packed).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Packing Checklist</h4>
          <p className="text-muted small mb-0">AI-generated checklist tailored for {trip.destination} ({trip.travel_type})</p>
        </div>
        <div className="d-flex align-items-center gap-3" style={{ minWidth: '240px' }}>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between mb-1 small fw-bold">
              <span>Progress</span>
              <span>{packedItems}/{totalItems} Packed ({progressPercent}%)</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: `${progressPercent}%` }} 
                aria-valuenow={progressPercent} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {totalItems > 0 ? (
        <div className="row g-4">
          {categories.map((category) => {
            const catItems = packingList.filter(item => item.category === category);
            if (catItems.length === 0) return null;

            return (
              <div className="col-md-6" key={category}>
                <div className="card bg-light border-0 p-4 rounded-4 shadow-sm h-100">
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </h5>
                  <div className="d-flex flex-column gap-2.5">
                    {catItems.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleTogglePacked(item.id)}
                        className={`d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white transition-all ${item.packed ? 'border-success bg-success-subtle text-success-emphasis' : 'border-light'} ${!readOnly ? 'cursor-pointer' : ''}`}
                        style={{ cursor: readOnly ? 'default' : 'pointer' }}
                      >
                        <span className={`small ${item.packed ? 'text-decoration-line-through text-muted' : 'fw-semibold text-dark'}`}>
                          {item.name}
                        </span>
                        <span className="fs-5">
                          {item.packed ? (
                            <FaCheckSquare className="text-success" />
                          ) : (
                            <FaSquare className="text-muted" style={{ opacity: 0.3 }} />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 bg-light rounded-4">
          <p className="text-muted small mb-0">No checklist items generated.</p>
        </div>
      )}
    </div>
  );
};

export default PackingAssistantTab;
