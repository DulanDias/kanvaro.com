import { SetupWizard } from '@/components/setup/setup-wizard';

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Kanvaro
            </h1>
            <p className="text-xl text-gray-600">
              Let's set up your agile project management system
            </p>
          </div>
          
          <SetupWizard />
        </div>
      </div>
    </div>
  );
}
