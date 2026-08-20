import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Award,
  Sparkles,
  Save,
  Check,
  Plus,
  X,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export function PersonalInfoSection({ user, onSave, saving, saveSuccess }) {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [preferredTone, setPreferredTone] = useState('PROFESSIONAL');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfession(user.profession || '');
      setBio(user.bio || '');
      setSkills(Array.isArray(user.skills) ? user.skills : []);
      setWritingStyle(user.writingStyle || '');
      setPreferredTone(user.preferredTone || 'PROFESSIONAL');
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      profession,
      bio,
      skills,
      writingStyle,
      preferredTone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Personal Information & Voice Context</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          These details ground your AI assistant so every generated post authentically reflects your expertise and style.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Personal profile context updated successfully!</span>
        </div>
      )}

      {/* Row 1: Full Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-zinc-400">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivers"
            className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-zinc-400">Email Address (Read-only)</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-900 text-sm text-zinc-500 cursor-not-allowed font-mono"
          />
        </div>
      </div>

      {/* Row 2: Profession / Role */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
          <span>Profession / Title</span>
        </label>
        <input
          type="text"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          placeholder="Senior Full Stack & AI Solutions Engineer"
          className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
        />
      </div>

      {/* Row 3: Interactive Skills Tag Manager */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-zinc-500" />
            <span>Key Skills & Specialties ({skills.length})</span>
          </span>
          <span className="text-[10px] text-zinc-500 lowercase font-mono">press enter to add</span>
        </label>

        <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {skills.length === 0 ? (
              <span className="text-xs text-zinc-600 italic">No skills added yet. Add some below.</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-zinc-500 hover:text-zinc-200 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. React, Distributed Systems, LLM Agent)..."
              className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Bio / Professional Context */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Professional Background & Context Bio</span>
        </label>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Summarize your career highlights, what drives you, key architectural projects, or milestones..."
          className="w-full p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 leading-relaxed transition-colors resize-y"
        />
        <p className="text-[10px] text-zinc-500 font-mono">
          The assistant references this context to avoid generic clichés and sound genuinely like you.
        </p>
      </div>

      {/* Row 5: Writing Style & Preferred Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-zinc-400">Writing Style</label>
          <input
            type="text"
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            placeholder="Concise, Story-driven, Technical takeaways"
            className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-zinc-400">Default Target Tone</label>
          <select
            value={preferredTone}
            onChange={(e) => setPreferredTone(e.target.value)}
            className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer"
          >
            <option value="PROFESSIONAL" className="bg-zinc-900">Professional & Insightful</option>
            <option value="STORYTELLING" className="bg-zinc-900">Storytelling & Narrative</option>
            <option value="TECHNICAL" className="bg-zinc-900">Deep Technical & Analytical</option>
            <option value="PERSONAL" className="bg-zinc-900">Personal & Candid</option>
            <option value="CONFIDENT" className="bg-zinc-900">Confident & High-Impact</option>
            <option value="MINIMAL" className="bg-zinc-900">Minimal & Punchy</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-zinc-800/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-black px-5 py-2.5 rounded-xl font-semibold text-xs transition disabled:opacity-50 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving changes...' : 'Save Personal Info'}</span>
        </button>
      </div>
    </form>
  );
}

export default PersonalInfoSection;
