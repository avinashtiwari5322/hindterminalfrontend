import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeightWorkPermit from './Homepage';
import HotWorkPermit from './HomepageHot';
import ElectricalWorkPermit from './HomepageElectric';
import GeneralWorkPermit from './HomepageNormal';
import { toast } from 'react-toastify';

const PermitDetails = () => {
  const { id } = useParams(); // Updated to use `id` instead of `permitId`
  const [permitData, setPermitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermitDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/permits/${id}`); // Updated to use `id`
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPermitData(data);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to fetch permit details. Please try again.'); 
      } finally {
        setLoading(false);
      }
    };

    fetchPermitDetails();
  }, [id]); // Updated dependency to `id`

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!permitData) {
    return <div>No permit data found.</div>;
  }

  const { PermitTypeId } = permitData;

  switch (PermitTypeId) {
    case 1:
      return <HeightWorkPermit {...permitData} />;
    case 2:
      return <HotWorkPermit {...permitData} />;
    case 3:
      return <ElectricalWorkPermit {...permitData} />;
    case 4:
      return <GeneralWorkPermit {...permitData} />;
    default:
      return <div>Invalid Permit Type</div>;
  }
};

export default PermitDetails;