import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import PageLayout from '../components/PageLayout';
import '../styles/skills.css';

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface UserSkill {
  id: number;
  verified: boolean;
  score: number | null;
  skill: Skill;
}

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export default function Skills() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSkillId, setAddingSkillId] = useState<number | null>(null);
  const [testSkill, setTestSkill] = useState<UserSkill | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; message: string } | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/skills'),
      api.get('/skills/my'),
    ]).then(([allRes, myRes]) => {
      setAllSkills((allRes.data as { skills: Skill[] }).skills);
      setMySkills((myRes.data as { skills: UserSkill[] }).skills);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddSkill = async (skillId: number) => {
    setAddingSkillId(skillId);
    try {
      const res = await api.post('/skills/add', { skillId });
      const data = res.data as { skill: UserSkill };
      setMySkills(prev => [data.skill, ...prev]);
      setSuccessMsg(`${data.skill.skill.name} added to your skills!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAddingSkillId(null);
    }
  };

  const handleRemoveSkill = async (userSkillId: number) => {
    try {
      await api.delete(`/skills/${userSkillId}`);
      setMySkills(prev => prev.filter(s => s.id !== userSkillId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTest = async (userSkill: UserSkill) => {
    setLoadingQuestions(true);
    setTestSkill(userSkill);
    setResult(null);
    setAnswers({});
    try {
      const res = await api.get(`/skills/${userSkill.skill.id}/questions`);
      const data = res.data as { questions: Question[] };
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!testSkill) return;
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/skills/${testSkill.skill.id}/assess`, { answers });
      const data = res.data as { score: number; passed: boolean; message: string };
      setResult(data);
      if (data.passed) {
        setMySkills(prev => prev.map(s =>
          s.id === testSkill.id ? { ...s, verified: true, score: data.score } : s
        ));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const mySkillIds = mySkills.map(s => s.skill.id);
  const availableSkills = allSkills.filter(s => !mySkillIds.includes(s.id));

  const groupedAvailable = availableSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (user?.role !== 'FRESHER') {
    return (
      <PageLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
            Skills are for freshers
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            Skill verification helps freshers prove their abilities to clients.
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="skills-main">
        <div className="skills-header">
          <div>
            <h1 className="skills-title">Skill Verification</h1>
            <p className="skills-subtitle">
              Add skills and take assessments to earn verified badges on your profile
            </p>
          </div>
        </div>

        {successMsg && <div className="skills-success">{successMsg}</div>}

        {testSkill && (
          <div className="skills-modal-overlay" onClick={() => !submitting && setTestSkill(null)}>
            <div className="skills-modal" onClick={e => e.stopPropagation()}>
              {!result ? (
                <>
                  <div className="skills-modal-header">
                    <div>
                      <h2 className="skills-modal-title">{testSkill.skill.name} Assessment</h2>
                      <p className="skills-modal-sub">Answer all {questions.length} questions. You need 70% to pass.</p>
                    </div>
                    <button className="skills-modal-close" onClick={() => setTestSkill(null)}>✕</button>
                  </div>

                  {loadingQuestions ? (
                    <div className="skills-loading">Loading questions...</div>
                  ) : (
                    <div className="skills-questions">
                      {questions.map((q, index) => (
                        <div key={q.id} className="skills-question">
                          <div className="skills-question-text">
                            {index + 1}. {q.question}
                          </div>
                          <div className="skills-options">
                            {(['A', 'B', 'C', 'D'] as const).map(opt => (
                              <div
                                key={opt}
                                className={`skills-option ${answers[q.id] === opt ? 'selected' : ''}`}
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              >
                                <span className="skills-option-letter">{opt}</span>
                                <span>{q[`option${opt}` as keyof Question]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="skills-test-footer">
                        <div className="skills-answered">
                          {Object.keys(answers).length}/{questions.length} answered
                        </div>
                        <button
                          className="skills-submit-btn"
                          onClick={handleSubmitTest}
                          disabled={submitting || Object.keys(answers).length < questions.length}
                        >
                          {submitting ? 'Grading...' : 'Submit answers →'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="skills-result">
                  <div className="skills-result-icon">{result.passed ? '🎉' : '😔'}</div>
                  <div className="skills-result-score">{result.score}%</div>
                  <div className="skills-result-msg">{result.message}</div>
                  {result.passed && (
                    <div className="skills-result-badge">
                      ✓ {testSkill.skill.name} — Verified
                    </div>
                  )}
                  <button
                    className="skills-submit-btn"
                    style={{ marginTop: 20 }}
                    onClick={() => setTestSkill(null)}
                  >
                    {result.passed ? 'Back to skills →' : 'Try again later →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="skills-loading">Loading skills...</div>
        ) : (
          <>
            <div className="skills-section">
              <div className="skills-section-title">
                🛡️ Your skills
                <span className="skills-count">{mySkills.length} added</span>
              </div>

              {mySkills.length === 0 ? (
                <div className="skills-empty">
                  No skills added yet. Add skills from the list below and take assessments to get verified.
                </div>
              ) : (
                <div className="skills-grid">
                  {mySkills.map(userSkill => (
                    <div key={userSkill.id} className={`skill-card ${userSkill.verified ? 'verified' : ''}`}>
                      <div className="skill-card-top">
                        <div className="skill-name">{userSkill.skill.name}</div>
                        {userSkill.verified ? (
                          <span className="skill-verified-badge">✓ Verified</span>
                        ) : (
                          <span className="skill-unverified-badge">Unverified</span>
                        )}
                      </div>
                      <div className="skill-category">{userSkill.skill.category}</div>
                      {userSkill.score !== null && (
                        <div className="skill-score">Last score: {userSkill.score}%</div>
                      )}
                      <div className="skill-card-actions">
                        {!userSkill.verified && (
                          <button
                            className="skill-test-btn"
                            onClick={() => handleStartTest(userSkill)}
                          >
                            Take test →
                          </button>
                        )}
                        <button
                          className="skill-remove-btn"
                          onClick={() => handleRemoveSkill(userSkill.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="skills-section">
              <div className="skills-section-title">
                ➕ Add skills
                <span className="skills-count">{availableSkills.length} available</span>
              </div>

              {Object.entries(groupedAvailable).map(([category, skills]) => (
                <div key={category} className="skills-category-group">
                  <div className="skills-category-label">{category}</div>
                  <div className="skills-add-grid">
                    {skills.map(skill => (
                      <button
                        key={skill.id}
                        className="skill-add-btn"
                        disabled={addingSkillId === skill.id}
                        onClick={() => handleAddSkill(skill.id)}
                      >
                        {addingSkillId === skill.id ? 'Adding...' : `+ ${skill.name}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}