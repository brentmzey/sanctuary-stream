export function HelpGuide() {
  const sections = [
    {
      title: '🎥 Streaming Control',
      icon: '🚀',
      content: 'Start and stop your live broadcast directly from this dashboard. Once started, the stream status will change to "Live" and diagnostics will appear.'
    },
    {
      title: '📁 Archive Recording',
      icon: '💾',
      content: 'Record high-quality copies of your services. Recordings are automatically uploaded to your church\'s Google Drive after they finish.'
    },
    {
      title: '🎬 Scene Selection',
      icon: '🖼️',
      content: 'Switch between different OBS scenes (e.g., "Pulpit", "Choir", "Congregation") to provide a dynamic experience for remote viewers.'
    },
    {
      title: '🎙️ Audio Management',
      icon: '🔊',
      content: 'Mute or unmute audio sources as needed during the service to ensure clear communication and silence during quiet moments.'
    },
    {
      title: '📊 Stream Health',
      icon: '📈',
      content: 'Monitor your bitrate, frame drops, and CPU load in real-time. If you see "Poor" or "Critical" health, check your internet connection or lower the video quality.'
    },
    {
      title: '🕊️ Pastoral Reflections',
      icon: '📖',
      content: 'Access sermon notes, church announcements, and other resources shared by your leadership team.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Sanctuary Stream Guide</h2>
        <p className="text-slate-400 max-w-2xl mx-auto font-medium">
          Everything you need to know to provide a seamless digital window into your sanctuary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-3xl shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <div className="text-4xl mb-6">{section.icon}</div>
            <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-center">
        <h3 className="text-lg font-bold text-white mb-4">Need Technical Support?</h3>
        <p className="text-slate-400 text-sm mb-8 font-medium">
          If you encounter any issues or have questions about the configuration, contact your church tech lead or visit our documentation portal.
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="https://github.com/your-org/sanctuary-stream/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-xs"
          >
            Full Documentation
          </a>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-white/5 uppercase tracking-widest text-xs">
            Open Support Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
