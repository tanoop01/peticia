'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Search, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function RAGAdminPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testQuery, setTestQuery] = useState('My employer has not paid my salary for 2 months');
  const [searchResults, setSearchResults] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/legal-documents/embeddings');
      const data = await response.json();
      setStatus(data);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateEmbeddings = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/legal-documents/embeddings', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(
          `Success! Processed ${data.processed} documents. ` +
          (data.failed > 0 ? `Failed: ${data.failed}. Errors: ${data.errors.join(', ')}` : '')
        );
        await checkStatus();
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setSearchResults(null);
    try {
      const response = await fetch('/api/legal-documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery }),
      });
      const data = await response.json();
      
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setSearchResults(data);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">RAG System Administration</h1>
          <p className="text-muted-foreground">
            Manage legal document embeddings for Retrieval Augmented Generation
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Embedding Status
          </CardTitle>
          <CardDescription>
            Current state of legal document embeddings in the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkStatus} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh Status
          </Button>

          {status && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Total Documents:</span>
                <span>{status.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">With Embeddings:</span>
                <span className="text-green-600 font-bold">{status.withEmbeddings}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Without Embeddings:</span>
                <span className="text-red-600 font-bold">{status.withoutEmbeddings}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Progress:</span>
                <span className="font-bold">{status.progress}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Embeddings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generate Embeddings
          </CardTitle>
          <CardDescription>
            Process all legal documents and generate embeddings for semantic search (Feature Disabled)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Embedding generation is currently disabled. This feature requires an AI service configuration.
            </AlertDescription>
          </Alert>

          <Button onClick={generateEmbeddings} disabled={true} className="w-full">
            Generate All Embeddings (Disabled)
          </Button>

          {message && (
            <Alert variant={message.includes('Error') ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Test Semantic Search
          </CardTitle>
          <CardDescription>
            Test the RAG system by searching for relevant legal documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Query</label>
            <textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="w-full p-3 border rounded-md min-h-[100px]"
              placeholder="Enter a legal scenario to search for..."
            />
          </div>

          <Button onClick={testSearch} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Search Legal Documents
          </Button>

          {searchResults && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">
                  Found {searchResults.count} relevant documents
                </p>
              </div>

              {searchResults.documents.map((doc: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg space-y-2 bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.act_name} {doc.section_number ? `- Section ${doc.section_number}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {(doc.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Legal Text:</span>
                      <p className="text-muted-foreground mt-1">{doc.content}</p>
                    </div>
                    {doc.plain_language_summary && (
                      <div>
                        <span className="font-medium">Plain Language:</span>
                        <p className="text-muted-foreground mt-1">{doc.plain_language_summary}</p>
                      </div>
                    )}
                    {doc.keywords && doc.keywords.length > 0 && (
                      <div>
                        <span className="font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doc.keywords.map((keyword: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {doc.source_url && (
                      <div>
                        <span className="font-medium">Source:</span>
                        <a
                          href={doc.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-2"
                        >
                          View Official Source
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
