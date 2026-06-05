"use client";

import {
  Award,
  Check,
  CircleHelp,
  Fish,
  Heart,
  Image,
  MessageCircle,
  MoreHorizontal,
  Quote,
  Share2,
  Star,
  Trophy,
} from "lucide-react";

const avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80";

const badges = [
  ["Lunker Hunter", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=140&q=80"],
  ["Super Angler", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=140&q=80"],
  ["Trophy Catch", "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=140&q=80"],
  ["Freshwater Pro", "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=140&q=80"],
];

const following = [
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=90&q=80",
];

const achievements = [
  { icon: Fish, title: "Bass Pro", body: "25 Largemouth Bass caught" },
  { icon: Image, title: "New Record", body: "6.2 lb" },
  { icon: Trophy, title: "Master Angler", body: "19 challenges completed" },
];

const posts = [
  {
    text: "Last weekend's catch! Managed to reel in this 6.4 lb Largemouth Bass from Lake Sammamish.",
    time: "5 days ago",
    tags: ["#LargemouthBass", "#WeekendFishing"],
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=1400&q=85",
    weight: "6.4 lb",
    likes: 64,
    comments: 17,
  },
  {
    text: "Beautiful morning at Lake Washington.",
    time: "2 weeks ago",
    tags: [],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
    likes: 48,
    comments: 12,
  },
];

export default function UserProfileWorkspace() {
  return (
    <section className="user-profile-page">
      <div className="user-profile-content">
        <main className="user-profile-main">
          <section className="profile-hero">
            <div className="profile-cover" />
            <div className="profile-identity">
              <span className="profile-avatar-wrap">
                <img src={avatar} alt="Alicia Vikander" />
                <i>
                  <Check size={14} />
                </i>
              </span>
              <h1>Alicia Vikander</h1>
              <p>@avikander</p>
              <span>Passionate angler from Seattle, WA. Always on the lookout for the next big catch!</span>
            </div>

            <div className="profile-stats-row">
              <strong>
                452 <span>Followers</span>
              </strong>
              <strong>
                178 <span>Following</span>
              </strong>
              <strong>
                178 <span>Following</span>
              </strong>
              <button type="button">Edit Profile</button>
            </div>

            <nav className="profile-tabs" aria-label="Profile sections">
              <button className="active" type="button">
                <Image size={18} />
                Posts
              </button>
              <button type="button">
                <Star size={18} />
                Achievements
              </button>
              <button type="button">
                <Image size={18} />
                Photos
              </button>
              <button type="button">
                <CircleHelp size={18} />
                Pro Tips
              </button>
            </nav>
          </section>

          <div className="profile-feed">
            {posts.map((post) => (
              <article className="profile-post-card" key={post.text}>
                <header>
                  <img src={avatar} alt="Alicia Vikander" />
                  <div>
                    <strong>Alicia Vikander</strong>
                    <span>{post.time}</span>
                    <small>Public</small>
                  </div>
                  <MoreHorizontal size={19} />
                </header>

                <p>{post.text}</p>

                {post.tags.length > 0 ? (
                  <div className="profile-post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                ) : null}

                <figure className="profile-post-image">
                  <img src={post.image} alt="" />
                  {post.weight ? <figcaption>{post.weight}</figcaption> : null}
                </figure>

                <footer>
                  <span>
                    <Heart size={19} />
                    {post.likes}
                  </span>
                  <span>
                    <MessageCircle size={19} />
                    {post.comments}
                  </span>
                  <span>
                    <Share2 size={18} />
                    Share
                  </span>
                </footer>
              </article>
            ))}
          </div>
        </main>

        <aside className="profile-side-card">
          <section className="angler-level">
            <div>
              <h2>Angler Level</h2>
              <strong>12</strong>
              <CircleHelp size={17} />
            </div>
            <div className="level-arc">
              <span>1540 / 1,800</span>
              <small>XP</small>
            </div>
            <p>Keep going, you're making great progress!</p>
          </section>

          <section className="profile-achievements">
            <header>
              <h2>Achievements</h2>
              <a href="/platform/profile">View all</a>
            </header>
            {achievements.map(({ icon: Icon, title, body }) => (
              <article key={title}>
                <span>
                  <Icon size={19} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{body}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="profile-badges">
            <header>
              <h2>Badges</h2>
              <a href="/platform/profile">View all</a>
            </header>
            <div>
              {badges.map(([label, image]) => (
                <figure key={label}>
                  <img src={image} alt={label} />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="profile-following">
            <header>
              <h2>Following</h2>
              <a href="/platform/social">View all (178)</a>
            </header>
            <div>
              {following.map((image) => (
                <img key={image} src={image} alt="Following user" />
              ))}
            </div>
          </section>

          <section className="profile-quote-card">
            <Quote size={30} />
            <p>The best days are spent where the water meets the soul.</p>
            <Award size={42} />
          </section>
        </aside>
      </div>
    </section>
  );
}
