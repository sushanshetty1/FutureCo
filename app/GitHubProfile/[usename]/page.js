"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import {
  Code2, Star, GitFork, ArrowUpRight,
  Loader2, GithubIcon, Globe, BookOpen
} from "lucide-react";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card";

const GitHubProfile = () => {
  const [isClient, setIsClient] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && window.location) {
      const { username } = window.location.pathname.split("/").pop();
      setUsername(username);
    }
  }, [isClient]);

  useEffect(() => {
    if (!username) return;

    const fetchGithubData = async () => {
      try {
        const headers = {};
        if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
          headers.Authorization = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
        }

        const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!userResponse.ok) {
          throw new Error(`GitHub API Error: ${userResponse.status}`);
        }
        const userData = await userResponse.json();

        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
          { headers }
        );
        if (!reposResponse.ok) {
          throw new Error(`GitHub Repos API Error: ${reposResponse.status}`);
        }
        const reposData = await reposResponse.json();

        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const languages = reposData.map(repo => repo.language).filter(Boolean);
        const topLanguages = [...new Set(languages)].slice(0, 5);

        setGithubData({
          ...userData,
          totalStars,
          topLanguages,
          recentRepos: reposData.slice(0, 3).map(repo => ({
            name: repo.name,
            description: repo.description || "No description available",
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url
          }))
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubData();
  }, [username]);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#a6ff00] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Card className="bg-[#1f1f1f] border-white/10 max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-[#a6ff00] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Error Loading Profile</h2>
              <p className="text-white/70">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={githubData.avatar_url}
              alt={githubData.login}
              className="w-16 h-16 rounded-full border-2 border-[#a6ff00]"
            />
            <div>
              <h1 className="text-4xl font-bold text-white">{githubData.name || githubData.login}</h1>
              <p className="text-white/70 mt-1">{githubData.bio || `@${githubData.login}`}</p>
            </div>
          </div>
          <a 
            href={githubData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#a6ff00] text-black hover:bg-white px-6 h-12 text-base inline-flex items-center justify-center rounded-md transition-colors"
          >
            View Profile
          </a>
        </div>

        {/* GitHub Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1f1f1f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#a6ff00]/10">
                  <Code2 className="w-6 h-6 text-[#a6ff00]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{githubData.public_repos}</p>
                  <p className="text-white/70">Repositories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#a6ff00]/10">
                  <Star className="w-6 h-6 text-[#a6ff00]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{githubData.totalStars}</p>
                  <p className="text-white/70">Total Stars</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#a6ff00]/10">
                  <GithubIcon className="w-6 h-6 text-[#a6ff00]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{githubData.followers}</p>
                  <p className="text-white/70">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#a6ff00]/10">
                  <Globe className="w-6 h-6 text-[#a6ff00]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{githubData.following}</p>
                  <p className="text-white/70">Following</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Repositories */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Repositories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {githubData.recentRepos.map((repo, index) => (
              <Card key={index} className="bg-[#1f1f1f] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {repo.name}
                    <a 
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a6ff00] hover:text-white"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </a>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {repo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-white/70">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {repo.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      {repo.forks}
                    </div>
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-[#a6ff00]"></span>
                        {repo.language}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Top Languages</h2>
          <div className="flex flex-wrap gap-2">
            {githubData.topLanguages.map((language, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-[#a6ff00]/10 text-[#a6ff00] text-sm"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubProfile;
