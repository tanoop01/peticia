'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Sparkles, Book, Scale, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || !user) return;

    setLoading(true);
    setResponse(null);

    try {
      const response = await fetch('/api/ai/rights-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language: user.preferredLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI guidance');
      }

      const data = await response.json();
      const aiResponse = data.guidance;

      setResponse(aiResponse);

      // Save to database
      try {
        await fetch('/api/ai-queries/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            query,
            language: user.preferredLanguage,
            response: aiResponse,
          }),
        });
      } catch (dbError) {
        // Log error but don't break user experience
        console.error('Failed to save query to database:', dbError);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Police asking for my phone without a warrant",
    "Landlord refusing to return security deposit",
    "Salary not paid for 2 months",
    "Workplace harassment by supervisor",
    "Street vendor license rejected unfairly",
    "Municipality not fixing potholes for months",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted p-8 text-foreground">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Rights Assistant</h1>
            <p className="text-muted-foreground">Get instant legal guidance in your language</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          icon={<Book className="w-5 h-5" />}
          title="Know Your Rights"
          description="Learn about Indian laws relevant to your situation"
        />
        <InfoCard
          icon={<Scale className="w-5 h-5" />}
          title="Legal Citations"
          description="Get specific articles, sections, and provisions"
        />
        <InfoCard
          icon={<Phone className="w-5 h-5" />}
          title="Where to Complain"
          description="Find the right authority for your issue"
        />
      </div>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle>Ask Your Question</CardTitle>
          <CardDescription>
            Describe your situation in your own words. Be as specific as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="query">Your Question</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: My employer hasn't paid my salary for 3 months. What are my legal rights? Where can I complain?"
              rows={6}
              className="mt-2"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Getting guidance...'
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Get Legal Guidance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      {!response && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Questions</CardTitle>
            <CardDescription>Click to use these common scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(q)}
                  className="text-left p-3 bg-bg-secondary border border-border-subtle rounded-lg hover:border-border-strong transition-colors text-text-primary"
                >
                  <MessageSquare className="w-4 h-4 text-foreground mb-2" />
                  <p className="text-sm">{q}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {response && (
        <Card className="border-2 border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-foreground" />
              <CardTitle>AI Legal Guidance</CardTitle>
            </div>
            <CardDescription>
              This is general guidance. Consult a lawyer for specific legal advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
            <div className="mt-6 pt-6 border-t flex gap-4">
              <Button onClick={() => setResponse(null)} variant="outline">
                Ask Another Question
              </Button>
              <Button
                onClick={() => {
                  // Navigate to petition creation with context
                  window.location.href = `/dashboard/create-petition?query=${encodeURIComponent(query)}`;
                }}
              >
                Create Petition from This
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({ icon, title, description }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-foreground mb-3">{icon}</div>
        <h3 className="font-semibold mb-1 text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
