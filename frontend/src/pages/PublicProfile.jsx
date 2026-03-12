import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';
import { Loader2, Tag } from 'lucide-react';
import useBookmarks from '../hooks/useBookmarks';

function PublicProfile() {
  const { email } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toggleBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    fetchPublicProfile();
  }, [email]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch public profile data
      const profileResponse = await axios.get(`/api/users/${email}/public`);
      setProfile(profileResponse.data);

      // Fetch user's posts
      const postsResponse = await axios.get('/api/posts');
      const filteredPosts = postsResponse.data.filter(
        post => post.user?.email === email
      );
      setUserPosts(filteredPosts);
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError('Failed to load profile. User may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-xl text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              {profile?.profileImage ? (
                <img
                  src={`http://localhost:8080${profile.profileImage}`}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-200">
                  {profile?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {profile?.name || 'Anonymous'}
              </h1>
              <p className="text-gray-600 mb-4">{profile?.email}</p>
              
              {profile?.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Interests Section */}
              {profile?.interests && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={16} className="text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">Interests</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.split(',').map((interest, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div>
                  <span className="font-semibold">{userPosts.length}</span> posts
                </div>
                <div>
                  Joined {formatDate(profile?.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User's Posts */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Posts by {profile?.name}
          </h2>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onBookmark={toggleBookmark}
                isBookmarked={isBookmarked(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600">
              {profile?.name} hasn't posted anything yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
