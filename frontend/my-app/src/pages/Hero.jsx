import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import "./Hero.css";

const features = [
  {
    icon: LayoutDashboard,
    title: "Kanban Boards",
    description: "Visual task management",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Stay in sync always",
  },
  {
    icon: CheckCircle2,
    title: "Task Tracking",
    description: "Never miss a deadline",
  },
];

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="hero-root">
      {/* HEADER */}
      <header className="hero-header">
        <div className="hero-header-inner">
          <div className="hero-brand">
            <div className="hero-logo">T</div>
            <span>ToggleNest</span>
          </div>

          <div className="hero-actions">
            <button className="btn ghost" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn primary" onClick={() => navigate("/signup")}>
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-content"
        >
          <span className="hero-badge">
            <Zap size={14} />
            Now in public beta
          </span>

          <h1>
            Manage your team's <br />
            <span className="gradient-text">workflow with ease</span>
          </h1>

          <p>
            ToggleNest helps teams organize tasks, track progress, and collaborate
            efficiently. Simple, fast, and built for modern teams.
          </p>

          <div className="hero-cta">
            <button
              className="btn primary big"
              onClick={() => navigate("/signup")}
            >
              Start for Free
              <ArrowRight size={18} />
            </button>
            <button
              className="btn outline big"
              onClick={() => navigate("/home")}
            >
              View Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="features-header"
        >
          <h2>Everything you need</h2>
          <p>
            Powerful features to help your team stay organized and productive
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="cta-box"
        >
          <h2>Ready to get started?</h2>
          <p>
            Join thousands of teams already using ToggleNest to streamline their
            workflow.
          </p>
          <button
            className="btn primary big"
            onClick={() => navigate("/signup")}
          >
            Get Started Free
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="hero-footer">
        <div className="footer-left">
          <div className="footer-logo">T</div>
          <span>ToggleNest © 2026</span>
        </div>
        <div className="footer-links">
          <a>Privacy</a>
          <a>Terms</a>
          <a>Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Hero;
