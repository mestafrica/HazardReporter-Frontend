import { useEffect, useState } from "react";
import PostHazzardReportUi from "../components/PostHazzardReportUi";
import RecentPostCard from "../components/RecentPostCard";
import { HazardReport } from "../types/hazardreport";
import { apiGetAllHazardReports, apiGetAllAnnouncements } from "../services/api";
import AirQuality from "../components/AirQuality";
import { useAuth } from "../context/AuthContext";

interface HazardResponse {
  hazardReports: HazardReport[];
}

interface Announcement {
  _id: string;
  title: string;
  description: string;
  date?: string;
  createdAt?: string;
  profileImage?: string;
  image?: string;
}

interface AnnouncementResponse {
  announcements: Announcement[];
}

export default function DashboardHomePage() {
  const { user } = useAuth();

  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [editingHazard, setEditingHazard] = useState<HazardReport | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Announcements
  const fetchAnnouncements = async () => {
    try {
      setAnnouncementLoading(true);
      setAnnouncementError(null);

      const response = (await apiGetAllAnnouncements()) as unknown as {
        data: AnnouncementResponse;
      };

      const sortedAnnouncements = (response.data.announcements || []).sort(
        (a, b) =>
          new Date(b.createdAt || b.date || "").getTime() -
          new Date(a.createdAt || a.date || "").getTime()
      );

      setAnnouncements(sortedAnnouncements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setAnnouncementError("Failed to load announcements.");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  //  Fetch Hazards
  const fetchHazards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = (await apiGetAllHazardReports()) as unknown as {
        data: HazardResponse;
      };

      const sortedHazards = (response.data.hazardReports || []).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setHazards(sortedHazards);
    } catch (err) {
      console.error("Error fetching hazards:", err);
      setError("Failed to load hazard reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHazards();
    fetchAnnouncements();
  }, []);

  const handleEditHazard = (hazard: HazardReport) => {
    setEditingHazard(hazard);
  };

  //  Clean Announcement Rendering 
  let announcementContent;

  if (announcementLoading) {
    announcementContent = (
      <div className="p-4 text-sm text-gray-500">Loading announcements...</div>
    );
  } else if (announcementError) {
    announcementContent = (
      <div className="p-4 text-sm text-red-500">{announcementError}</div>
    );
  } else if (announcements.length > 0) {
    announcementContent = announcements.map((post) => (
      <div
        key={post._id}
        className="w-[95%] mx-auto rounded-lg flex gap-2 mb-3 justify-center items-center"
      >
        <div className="bg-gray-100 w-40 h-20 m-2 rounded-lg overflow-hidden">
          <img
            src={post.profileImage || post.image || "/placeholder.png"}
            alt={post.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 leading-5">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500">
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : post.date || "No date"}
          </p>
          <p className="text-sm text-gray-700 leading-4">
            {post.description}
          </p>
        </div>
      </div>
    ));
  } else {
    announcementContent = (
      <div className="p-4 text-sm text-gray-500">
        No announcements available.
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  //  Error State
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchHazards}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-10">
      <div className="w-[95%] mx-auto">
        <div className="flex gap-x-4 my-4 md:my-6">

          {/* REPORT SECTION */}
          <div className="bg-white rounded-md md:w-2/3 w-full md:h-[200px] shadow-sm">
            {user ? (
              <PostHazzardReportUi
                onSuccess={() => {
                  fetchHazards();
                  setEditingHazard(null);
                }}
                editingHazard={editingHazard}
              />
            ) : (
              <div className="bg-[url('./assets/images/clean-dirty-environment.png')] bg-cover bg-center bg-no-repeat rounded-lg shadow-md md:h-[200px]">
                <div className="p-6 text-center bg-black/20 rounded-lg backdrop-brightness-75 md:h-[200px] flex flex-col justify-center items-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Environmental Hazard Reporting
                  </h3>
                  <p className="text-white mb-4">
                    A Critical Step Towards a Safer Planet
                  </p>
                  <a
                    href="/login"
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Make a report
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* AIR QUALITY */}
          <div className="hidden md:block bg-white md:w-1/3 w-full rounded-md shadow-sm">
            <AirQuality />
          </div>
        </div>

        <div className="flex gap-6 md:w-full">

          {/* RECENT POSTS */}
          <section className="mb-8 w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Post
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {hazards.length > 0 ? (
                hazards.map((hazard) => (
                  <RecentPostCard
                    key={hazard._id}
                    hazard={hazard}
                    onEdit={handleEditHazard}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">
                    No hazard reports found
                  </p>
                  <button
                    onClick={fetchHazards}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ANNOUNCEMENTS */}
          <section className="md:w-[65%] hidden md:block sticky top-20 h-[80vh]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Announcement
            </h2>

            <div className="sticky top-20 h-[80vh] bg-white overflow-y-auto scroll-smooth rounded-lg shadow-sm hover:shadow-md transition">
              <div className="rounded-lg">
                {announcementContent}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}