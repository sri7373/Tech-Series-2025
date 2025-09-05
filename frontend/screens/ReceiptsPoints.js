import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export default function ReceiptsPoints({ route, navigation }) {
  // Expect route.params.items (array) and route.params.totalPoints (number)
  const { items = [], totalPoints = 0 } = route?.params || {};
  const [prevPoints, setPrevPoints] = useState(null);
  const [updatedPoints, setUpdatedPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const updateUserPoints = async () => {
      setLoading(true);
      try {
        // Get token and userId from localStorage (web)
        const token = localStorage.getItem('userToken');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
          alert('Not logged in. Please log in first.');
          setLoading(false);
          return;
        }
        // Get current user points
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.error || 'Failed to fetch user profile');
          setLoading(false);
          return;
        }
        setPrevPoints(data.points);
        // Update user points in DB
        const newPoints = (data.points || 0) + (totalPoints || 0);
        setUpdatedPoints(newPoints);
        const updateRes = await fetch(`http://localhost:3000/api/users/${userId}/points`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ points: newPoints }),
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) {
          alert(updateData.error || 'Failed to update points');
        }
      } catch (err) {
        alert('Network error');
      } finally {
        setLoading(false);
      }
    };
    updateUserPoints();

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalPoints]);


    // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <span style={{ color: '#007AFF', fontSize: 22 }}>Loading...</span>
      </div>
    );
  }

return (
    <div style={styles.container}>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
      
      {/* Decorative Vines/Trees (CSS animated) */}
      <div style={styles.vinesContainer}>
        <div style={styles.vine}></div>
        <div style={{ ...styles.vine, left: '80%', animationDelay: '1s' }}></div>
      </div>

      <button style={styles.returnButton} onClick={() => navigation && navigation.navigate('Home')}>
        ← Home
      </button>
      <h2 style={styles.title}>Receipt Points</h2>

      <div style={styles.pointsBox}>
        <span style={styles.pointsText}>Previous Points: {prevPoints}</span><br />
        <span style={styles.pointsText}>Receipt Points: {totalPoints}</span><br />
        <span style={styles.pointsText}>Updated Points: {updatedPoints}</span>
      </div>

      <div style={styles.itemsList}>
        {items.length === 0 ? (
          <span style={styles.noItems}>No items scanned.</span>
        ) : (
          items.map((item, idx) => (
            <div key={idx} style={styles.itemRow}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
              ) : (
                <span style={styles.noImage}>No Image</span>
              )}
              <span style={styles.itemName}>{item.name}</span>
              <span style={styles.itemQty}>Qty: {item.qty}</span>
              <span style={styles.itemPoints}>Points: {item.pointsEarned ?? item.points}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f8f9fa',
    position: 'relative',
  },
  returnButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    background: '#fff',
    padding: '6px 14px',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007AFF',
    border: 'none',
    cursor: 'pointer',
    zIndex: 2,
  },
  title: {
    marginTop: 80,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  pointsBox: {
    marginTop: 30,
    background: '#28a745',
    padding: '12px 30px',
    borderRadius: 10,
    color: '#fff',
    fontSize: 22,
    fontWeight: 600,
    border: 'none',
    display: 'inline-block',
  },
  pointsText: {
    fontSize: 22,
    fontWeight: 600,
  },
  itemsList: {
    marginTop: 40,
    width: '80%',
    maxWidth: 500,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    padding: 24,
  },
  noItems: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
    gap: 16,
  },
  itemImage: {
    width: 48,
    height: 48,
    objectFit: 'cover',
    borderRadius: 8,
    marginRight: 8,
  },
  noImage: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eee',
    color: '#888',
    borderRadius: 8,
    fontSize: 12,
    marginRight: 8,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  itemQty: {
    fontSize: 16,
    color: '#555',
    marginLeft: 20,
  },
  itemPoints: {
    fontSize: 16,
    color: '#28a745',
    marginLeft: 20,
    fontWeight: 'bold',
  },
};
