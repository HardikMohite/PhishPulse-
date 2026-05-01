/**
 * SimulationPlaceholderPage
 *
 * Temporary page rendered at /incident-gate/simulation.
 * Will be replaced by the real simulation experience in a later phase.
 */
const SimulationPlaceholderPage = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <p
      style={{
        color: '#ffffff',
        fontFamily: 'inherit',
        fontSize: '1.25rem',
        letterSpacing: '0.05em',
        margin: 0,
      }}
    >
      Simulation coming soon
    </p>
  </div>
);

export default SimulationPlaceholderPage;
