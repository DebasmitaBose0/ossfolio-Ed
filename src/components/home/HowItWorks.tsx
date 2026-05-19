const steps = [
  {
    number: "01",
    title: "Sign in with GitHub",
    description:
      "One click with your GitHub account. No forms, no manual data entry. We only request read access to public information.",
  },
  {
    number: "02",
    title: "Your profile is built automatically",
    description:
      "We pull your contributions, PRs, issues, orgs, and tech stack from the GitHub API. Your profile is ready in seconds.",
  },
  {
    number: "03",
    title: "Share your link",
    description:
      "You get a public profile at ossfolio.me/username. Drop it on your resume, LinkedIn, or anywhere you want your work to be seen.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ backgroundColor: "#ffffff" }}>
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "80px 20px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            style={{ fontSize: "13px", fontWeight: 500, color: "#3ecf8e", marginBottom: "10px" }}
          >
            Simple by design
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 36px)",
              fontWeight: 600,
              color: "#171717",
              letterSpacing: "-0.72px",
              lineHeight: 1.15,
            }}
          >
            Up and running in 30 seconds
          </h2>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "32px",
          }}
        >
          {steps.map(({ number, title, description }) => (
            <div key={number} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "44px",
                  width: "44px",
                  border: "1px solid #dfdfdf",
                  borderRadius: "9999px",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#3ecf8e",
                }}
              >
                {number}
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#171717" }}>
                  {title}
                </h3>
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "#707070",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
