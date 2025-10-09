export default function UserCard({ user }) {
  const avatar =
    user.avatar && user.avatar.trim() !== "" ? user.avatar : "/src/default_pfp.png";

  return (
    <div className="user-card" onClick={() => (window.location.href = `/profile?id=${user.id}`)}>
      <img src={avatar} alt="avatar" className="user-avatar" />
      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
      </div>

      <style jsx>{`
        .user-card {
          display: flex;
          align-items: center;
          gap: 20px;
          background-color: #070707;
          border: 1px solid #112211;
          padding: 15px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .user-card:hover {
          background-color: #0a100a;
          transform: translateY(-1px);
        }

        .user-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          background-color: #050505;
          border: 1px solid #112211;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 16px;
          color: #9eb897;
        }

        .user-email {
          font-size: 11px;
          color: #698969;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
