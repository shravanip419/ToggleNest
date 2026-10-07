import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import "./ManageMembers.css";

const ManageMembers = ({ project, onClose, onMemberChange }) => {
  const [members, setMembers] = useState([]);
  const [owner, setOwner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // userId being acted on
  const [error, setError] = useState("");
  const searchTimeout = useRef(null);

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${project._id}/members`);
      setOwner(data.owner);
      setMembers(data.members);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [project._id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(
          `/projects/${project._id}/members/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        setSearchResults(data);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery, project._id]);

  const handleAddMember = async (user) => {
    setActionLoading(user._id);
    setError("");
    try {
      await api.post(`/projects/${project._id}/members`, { userId: user._id });
      setSearchQuery("");
      setSearchResults([]);
      await fetchMembers();
      onMemberChange && onMemberChange();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add member");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    setActionLoading(userId);
    setError("");
    try {
      await api.delete(`/projects/${project._id}/members/${userId}`);
      await fetchMembers();
      onMemberChange && onMemberChange();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name = "") => name.charAt(0).toUpperCase() || "U";

  const getAvatarColor = (name = "") => {
    const colors = ["#6366f1", "#7c3aed", "#db2777", "#0891b2", "#059669", "#d97706"];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mm-header">
          <div>
            <h2>Manage Members</h2>
            <p className="mm-subtitle">{project.name}</p>
          </div>
          <button className="mm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="mm-error">⚠️ {error}</div>}

        {/* Search Section */}
        <div className="mm-section">
          <label className="mm-label">Add Team Member</label>
          <div className="mm-search-wrap">
            <span className="mm-search-icon">🔍</span>
            <input
              type="text"
              className="mm-search-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="mm-search-clear"
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results */}
          {(searching || searchResults.length > 0) && (
            <div className="mm-results">
              {searching ? (
                <div className="mm-results-loading">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="mm-results-empty">No users found</div>
              ) : (
                searchResults.map((user) => (
                  <div key={user._id} className="mm-result-item">
                    <div
                      className="mm-avatar"
                      style={{ backgroundColor: getAvatarColor(user.name) }}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <div className="mm-user-info">
                      <span className="mm-user-name">{user.name}</span>
                      <span className="mm-user-email">{user.email}</span>
                    </div>
                    <button
                      className="mm-add-btn"
                      onClick={() => handleAddMember(user)}
                      disabled={actionLoading === user._id}
                    >
                      {actionLoading === user._id ? "Adding..." : "+ Add"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Current Members List */}
        <div className="mm-section">
          <label className="mm-label">
            Team Members ({loading ? "..." : 1 + members.length})
          </label>

          {loading ? (
            <div className="mm-loading">Loading members...</div>
          ) : (
            <div className="mm-members-list">
              {/* Owner */}
              {owner && (
                <div className="mm-member-item">
                  <div
                    className="mm-avatar"
                    style={{ backgroundColor: getAvatarColor(owner.name) }}
                  >
                    {owner.avatar ? (
                      <img src={owner.avatar} alt={owner.name} />
                    ) : (
                      getInitials(owner.name)
                    )}
                  </div>
                  <div className="mm-user-info">
                    <span className="mm-user-name">{owner.name}</span>
                    <span className="mm-user-email">{owner.email}</span>
                  </div>
                  <span className="mm-role-badge mm-role-owner">Owner</span>
                </div>
              )}

              {/* Members */}
              {members.length === 0 ? (
                <p className="mm-no-members">
                  No members added yet. Search above to invite teammates.
                </p>
              ) : (
                members.map((member) => (
                  <div key={member._id} className="mm-member-item">
                    <div
                      className="mm-avatar"
                      style={{ backgroundColor: getAvatarColor(member.name) }}
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        getInitials(member.name)
                      )}
                    </div>
                    <div className="mm-user-info">
                      <span className="mm-user-name">{member.name}</span>
                      <span className="mm-user-email">{member.email}</span>
                    </div>
                    <span className="mm-role-badge mm-role-member">Member</span>
                    <button
                      className="mm-remove-btn"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={actionLoading === member._id}
                      title="Remove member"
                    >
                      {actionLoading === member._id ? "..." : "Remove"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;
