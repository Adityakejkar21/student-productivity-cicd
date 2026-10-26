
import React from 'react';

function App() {
  const tasks = [
    { title: 'Complete CI/CD assignment', status: 'In Progress' },
    { title: 'Revise computer networks', status: 'Pending' },
    { title: 'Submit project report', status: 'Completed' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>Student Productivity Hub</h1>
        <p>Your tasks. Your goals. Your progress.</p>
      </header>

      <main style={styles.main}>
        <h2>Welcome, Student!</h2>
        <p>Manage your academic tasks in one simple dashboard.</p>

        <section style={styles.card}>
          <h3>My Tasks</h3>
          {tasks.map((task, index) => (
            <div key={index} style={styles.task}>
              <span>{task.title}</span>
              <span style={styles.status}>{task.status}</span>
            </div>
          ))}
        </section>

        <p style={styles.footer}>
          Deployed using Jenkins, Docker and AWS EC2.
        </p>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    color: '#1e293b',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: '#1d4ed8',
    color: 'white',
    padding: '32px 20px',
    textAlign: 'center'
  },
  main: {
    maxWidth: '760px',
    margin: '35px auto',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginTop: '24px'
  },
  task: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '16px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  status: {
    color: '#1d4ed8',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: '28px',
    fontSize: '14px'
  }
};

export default App;
