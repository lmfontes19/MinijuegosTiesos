'use client'

import Link from 'next/link';

export default function TaskRules() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#0F172A] rounded-lg shadow overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center mb-8">
            <Link href="/dashboard/advertise" className="mr-4 text-[#6366F1] hover:text-[#4F46E5]">
              ← Back to Campaign Creation
            </Link>
            <h1 className="text-2xl font-bold text-white">Task Type Examples</h1>
          </div>
          
          <div className="space-y-10">
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h2 className="text-xl text-white font-semibold mb-4">Important Guidelines</h2>
              <div className="text-[#94A3B8] space-y-4">
                <p>
                  All campaigns must comply with our platform rules. Any campaign that violates these rules will be rejected. 
                  Please make sure to review these examples before creating your campaign to ensure quick approval.
                </p>
                <p className="text-[#F87171]">
                  <strong>Warning:</strong> Campaigns promoting illegal activities, scams, or harmful content will be immediately rejected
                  and may result in account termination.
                </p>
              </div>
            </div>
            
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h2 className="text-xl text-white font-semibold mb-4">Website Engagement Tasks</h2>
              <div className="text-[#94A3B8] space-y-4">
                <p>
                  These tasks involve users visiting your website and performing specific actions.
                </p>
                <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155]">
                  <h3 className="text-[#60A5FA] font-medium mb-2">Example: Article Reading</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Task Title:</strong> Read our article and answer a question</li>
                    <li><strong>Requirements:</strong> Visit our website, read the article "10 Tips for Success", and answer a verification question</li>
                    <li><strong>Proof Required:</strong> Screenshot showing the completed article page and provide answer to the verification question</li>
                    <li><strong>Actions:</strong> Visit website, scroll through article, answer question</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h2 className="text-xl text-white font-semibold mb-4">Form Submission Tasks</h2>
              <div className="text-[#94A3B8] space-y-4">
                <p>
                  These tasks involve users filling out forms or surveys on your website.
                </p>
                <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155]">
                  <h3 className="text-[#60A5FA] font-medium mb-2">Example: Survey Completion</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Task Title:</strong> Complete our 2-minute product preference survey</li>
                    <li><strong>Requirements:</strong> Fill out all required fields in our product survey</li>
                    <li><strong>Proof Required:</strong> Screenshot of the survey completion confirmation page</li>
                    <li><strong>Actions:</strong> Visit website, complete survey with honest responses</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h2 className="text-xl text-white font-semibold mb-4">Social Media Engagement</h2>
              <div className="text-[#94A3B8] space-y-4">
                <p>
                  These tasks involve interacting with your social media content.
                </p>
                <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155]">
                  <h3 className="text-[#60A5FA] font-medium mb-2">Example: YouTube Video Watch</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Task Title:</strong> Watch our product demonstration video</li>
                    <li><strong>Requirements:</strong> Watch at least 3 minutes of our product demonstration</li>
                    <li><strong>Proof Required:</strong> Screenshot of the video player at the 3-minute mark and comment on what you learned</li>
                    <li><strong>Actions:</strong> Visit YouTube link, watch video, take screenshot</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h2 className="text-xl text-white font-semibold mb-4">App Download & Usage</h2>
              <div className="text-[#94A3B8] space-y-4">
                <p>
                  These tasks involve downloading and trying your mobile application.
                </p>
                <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155]">
                  <h3 className="text-[#60A5FA] font-medium mb-2">Example: App Trial</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Task Title:</strong> Download and try our fitness tracking app</li>
                    <li><strong>Requirements:</strong> Download our app from the App Store/Google Play, create an account, and log one activity</li>
                    <li><strong>Proof Required:</strong> Screenshots showing app installation and activity logged in your account</li>
                    <li><strong>Actions:</strong> Download app, create account, log activity</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <h2 className="text-xl text-white font-semibold mb-4">Prohibited Task Types</h2>
              <div className="text-[#94A3B8] space-y-4">
                <p className="text-[#F87171]">
                  The following types of tasks are not allowed on our platform:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Tasks requiring users to make financial investments or deposits exceeding $1</li>
                  <li>Tasks promoting illegal activities or products</li>
                  <li>Tasks requiring users to download suspicious software</li>
                  <li>Tasks requiring users to provide sensitive personal information</li>
                  <li>Tasks involving adult content or gambling</li>
                  <li>Tasks that mislead users about the required actions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 