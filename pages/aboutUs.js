import { useState, useEffect } from "react";
import Header from "../components/header";
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'


function MobileOptimizer() {
  useEffect(() => {
    document.documentElement.classList.add('mobile-optimized');
    
    const preventZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  return null;
}

export default function AboutUs() {
  const { t } = useTranslation(['about', 'common']); 
  const [activeSection, setActiveSection] = useState("mission");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  
    const teamMembers = [
    {
      id: 1,
      name: t('teamSection.members.artiom.name', { ns: 'about' }), 
      role: t('teamSection.members.artiom.role', { ns: 'about' }),
      avatar: "/src/default_pfp.png"
    },
    {
      id: 2,
      name: t('teamSection.members.yana.name', { ns: 'about' }),
      role: t('teamSection.members.yana.role', { ns: 'about' }),
      avatar: "/src/default_pfp.png"
    },
    {
      id: 3,
      name: t('teamSection.members.emiliya.name', { ns: 'about' }),
      role: t('teamSection.members.emiliya.role', { ns: 'about' }),
      avatar: "/src/default_pfp.png"
    },
    {
      id: 4,
      name: t('teamSection.members.sofiya.name', { ns: 'about' }),
      role: t('teamSection.members.sofiya.role', { ns: 'about' }),
      avatar: "/src/default_pfp.png"
    }
  ];

  
  const sections = {
    mission: {
      title: t('about:sections.mission.title'),
      content: t('about:sections.mission.content')
    },
    proof: {
      title: t('about:sections.proof.title'),
      content: t('about:sections.proof.content')
    },
    story: {
      title: t('about:sections.story.title'),
      content: t('about:sections.story.content')
    },
    media: {
      title: t('about:sections.media.title'),
      content: t('about:sections.media.content')
    },
    problem: {
      title: t('about:sections.problem.title'),
      content: t('about:sections.problem.content')
    },
    action: {
      title: t('about:sections.action.title'),
      content: t('about:sections.action.content')
    }
  };

  const openModal = (sectionKey) => {
    setModalContent(sections[sectionKey]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent({});
  };

  return (
    <>
      <MobileOptimizer />
      <Header />
      <div className="about-container">
        <div className="about-header">
          <h1 className="about-title">{t('about:pageTitle')}</h1> 
          <p className="about-subtitle">{t('about:pageSubtitle')}</p> 
        </div>

        <div className="sections-grid">
          {Object.entries(sections).map(([key, section]) => (
            <div 
              key={key}
              className="section-card"
              onClick={() => openModal(key)}
            >
              <h3 className="section-title">{section.title}</h3>
              <div className="section-preview">
                {section.content.substring(0, 100)}...
              </div>
              <button className="btn btn-read-more">
                {t('about:buttons.readMore')} 
              </button>
            </div>
          ))}
        </div>

        <hr className="section-divider" />

        <div className="team-section">
          <h2>{t('about:teamSection.title')}</h2> 
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="team-avatar"
                />
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

       
        <div className={`modal ${modalOpen ? "open" : ""}`}>
          <div className="modal-content about-modal">
            <div className="close-modal" onClick={closeModal}>&times;</div>
            <h2>{modalContent.title}</h2>
            <div className="modal-body">
              <p>{modalContent.content}</p>
              {activeSection === 'media' && (
                <div className="media-placeholder">
                  <div className="placeholder-image">
                    {t('about:modal.mediaPlaceholder')} 
                  </div>
                  <div className="placeholder-image">
                    {t('about:modal.mediaPlaceholder')}
                  </div>
                  <div className="placeholder-image">
                    {t('about:modal.mediaPlaceholder')}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn btn-edit">
                {t('about:buttons.close')} 
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        .about-container {
          max-width: 1200px;
          margin: 2rem auto;
          background-color: #0a1b31;
          padding: 2rem;
          border: 2px solid #3f3d40;
          color: #9c9cc9;
          font-family: 'Basiic', sans-serif;
        }

        .about-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #3f3d40;
        }

        .about-title {
          color: #fff;
          font-size: 3rem;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .about-subtitle {
          color: #9c9cc9;
          font-size: 1.2rem;
          margin: 0;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .section-card {
          background: #000;
          border: 1px solid #3a3a90;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .section-card:hover {
          border-color: #41d3d2;
          transform: translateY(-5px);
        }

        .section-title {
          color: #fff;
          font-size: 1.4rem;
          margin: 0 0 1rem 0;
          border-bottom: 1px solid #41d3d2;
          padding-bottom: 0.5rem;
        }

        .section-preview {
          color: #9c9cc9;
          flex-grow: 1;
          margin-bottom: 1rem;
        }

        .btn-read-more {
          background: #000;
          color: #41d3d2;
          border: 1px solid #41d3d2;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-family: 'Basiic', sans-serif;
          align-self: flex-start;
        }

        .section-divider {
          border: none;
          height: 1px;
          background: #3f3d40;
          margin: 3rem 0;
        }

        .team-section {
          margin-top: 3rem;
        }

        .team-section h2 {
          color: #fff;
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          text-transform: uppercase;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .team-card {
          background: #000;
          border: 1px solid #3a3a90;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .team-card:hover {
          border-color: #ffb3ff;
          transform: translateY(-5px);
        }

        .team-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          margin: 0 auto 1rem auto;
        }

        .team-name {
          color: #fff;
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
        }

        .team-role {
          color: #41d3d2;
          font-size: 1rem;
          margin: 0 0 1rem 0;
          font-weight: bold;
        }

        .modal {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .modal.open {
          display: flex;
        }

        .about-modal {
          position: relative;
          background: #0a1b31;
          padding: 2rem;
          border-radius: 10px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          border: 2px solid #41d3d2;
        }

        .about-modal h2 {
          color: #fff;
          font-size: 2rem;
          margin: 0 0 1.5rem 0;
          text-align: center;
          border-bottom: 1px solid #41d3d2;
          padding-bottom: 1rem;
        }

        .modal-body {
          color: #9c9cc9;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .media-placeholder {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 2rem;
        }

        .placeholder-image {
          height: 100px;
          background: #000;
          border: 1px solid #3a3a90;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9c9cc9;
        }

        .close-modal {
          position: absolute;
          top: 15px;
          right: 20px;
          color: white;
          cursor: pointer;
          font-size: 2rem;
          transition: color 0.3s ease;
        }

        .close-modal:hover {
          color: #41d3d2;
        }

        .modal-actions {
          margin-top: 2rem;
          text-align: center;
        }

        .btn {
          cursor: pointer;
          padding: 0.45rem 0.75rem;
          margin-right: 0.5rem;
          border-radius: 0;
          font-family: 'Basiic', sans-serif;
        }

        .btn-edit {
          background: #000;
          color: #fff;
          border: 1px solid #41d3d2;
        }

        @media (max-width: 768px) {
          .about-container {
            margin: 1rem;
            padding: 1rem;
          }

          .about-title {
            font-size: 2rem;
          }

          .sections-grid {
            grid-template-columns: 1fr;
          }

          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}


export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['about', 'common','components'])),
    },
  }
}