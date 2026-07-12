import './Certifications.css';

const certifications = [
  { title: 'Database Management System', issuer: 'NPTEL' },
  { title: 'Data Structures and Algorithms using Java', issuer: 'NPTEL' },
];

export default function Certifications() {
  return (
    <section className="certifications section" id="certifications">
      <div className="container">
        <h2 className="section-title">
          Licenses & <span className="highlight">Certifications</span>
        </h2>
        <div className="cert-grid">
          {certifications.map((cert, i) => (
            <div className="cert-card" key={i}>
              <div className="cert-icon">🏅</div>
              <div className="cert-info">
                <h3 className="cert-title">{cert.title}</h3>
                <p className="cert-issuer">{cert.issuer}</p>
                <span className="cert-badge">Certified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
