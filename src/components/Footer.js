export default function Footer() {
  const footerStyle = {
    marginTop: '40px',
    padding: '20px 0',
    textAlign: 'center',
    color: 'var(--gray)',
    fontSize: '0.9rem'
  };

  return (
    <footer style={footerStyle}>
      &copy; 2025 Smart Parking Admin Dashboard.
    </footer>
  );
}
