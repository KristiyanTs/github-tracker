'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { updateProfile, getProfile } from '@/lib/profile-utils';

export default function ProfileSetup() {
  const { user, ensureProfile } = useAuth();
  const [githubUsername, setGithubUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Check if user needs to set up their profile
  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const profile = await getProfile(user.id);
        if (profile && (!profile.github_username || profile.github_username === '')) {
          setShowSetup(true);
        }
      }
    };
    
    checkProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !githubUsername.trim()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const updatedProfile = await updateProfile(user.id, {
        github_username: githubUsername.trim()
      });

      if (updatedProfile) {
        setMessage('GitHub username updated successfully!');
        setShowSetup(false);
        // Refresh the profile
        await ensureProfile();
      } else {
        setMessage('Failed to update GitHub username. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !showSetup) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Complete Your Profile</h2>
      <p className="text-gray-300 mb-4">
        To get started, please enter your GitHub username. This will allow us to fetch your activity data.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="github-username" className="block text-sm font-medium text-gray-300 mb-2">
            GitHub Username
          </label>
          <input
            type="text"
            id="github-username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your GitHub username"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !githubUsername.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isLoading ? 'Updating...' : 'Save Username'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('successfully') 
            ? 'bg-green-900 border border-green-700 text-green-200' 
            : 'bg-red-900 border border-red-700 text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
