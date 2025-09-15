import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseUrlParams, buildUrlParams, DEFAULT_FILTER_STATE } from "@/lib/utils";

export default function UrlDebug() {
  const [location, navigate] = useLocation();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Capture all URL-related information
    const info = {
      timestamp: new Date().toISOString(),
      windowLocation: {
        href: window.location.href,
        search: window.location.search,
        pathname: window.location.pathname,
        hash: window.location.hash
      },
      wouterLocation: location,
      wouterSearch: location.split('?')[1] || '',
      wouterFullSearch: location.split('?')[1] ? `?${location.split('?')[1]}` : '',
      parseResultFromWindow: parseUrlParams(window.location.search),
      parseResultFromWouter: parseUrlParams(location.split('?')[1] ? `?${location.split('?')[1]}` : '')
    };
    
    setDebugInfo(info);
    console.log('URL Debug Info:', info);
  }, [location]);

  const testUrlParsing = () => {
    const currentWindowSearch = window.location.search;
    const currentWouterSearch = location.split('?')[1] ? `?${location.split('?')[1]}` : '';
    
    const windowResult = parseUrlParams(currentWindowSearch);
    const wouterResult = parseUrlParams(currentWouterSearch);
    
    const results = [
      {
        name: "Window Location Parse",
        input: currentWindowSearch,
        result: windowResult,
        timestamp: new Date().toISOString()
      },
      {
        name: "Wouter Location Parse", 
        input: currentWouterSearch,
        result: wouterResult,
        timestamp: new Date().toISOString()
      },
      {
        name: "Results Match",
        input: "Comparison",
        result: { 
          filtersMatch: JSON.stringify(windowResult.filters) === JSON.stringify(wouterResult.filters),
          tabsMatch: windowResult.activeTab === wouterResult.activeTab,
          fullMatch: JSON.stringify(windowResult) === JSON.stringify(wouterResult)
        },
        timestamp: new Date().toISOString()
      }
    ];
    
    setTestResults(results);
  };

  const navigateWithParams = (params: string) => {
    const url = `/url-debug${params}`;
    console.log('Navigating to:', url);
    navigate(url);
  };

  const testCases = [
    { name: "Basic filters", params: "?region=NCR&status=Ongoing" },
    { name: "Office parameter", params: "?office=DPWH-CO&tab=table" },
    { name: "Legacy parameter", params: "?implementingOffice=Manila%20District" },
    { name: "Search + Special chars", params: "?search=highway%20project&contractor=ABC%20Corp" },
    { name: "All filters", params: "?search=test&region=NCR&office=DPWH-CO&contractor=Test%20Corp&status=Ongoing&year=2024&province=Metro%20Manila&municipality=Manila&barangay=Ermita&tab=admin" },
    { name: "Clear parameters", params: "" }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">URL Debug & Test Page</h1>
          <p className="text-muted-foreground mt-2">
            Debugging URL parameter parsing for DPWH Dashboard
          </p>
        </div>

        {/* Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {testCases.map((testCase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWithParams(testCase.params)}
                  data-testid={`button-nav-${index}`}
                >
                  {testCase.name}
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
            <Button onClick={testUrlParsing} data-testid="button-test-parsing">
              Test Current URL Parsing
            </Button>
          </CardContent>
        </Card>

        {/* Current URL Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current URL Information</CardTitle>
          </CardHeader>
          <CardContent>
            {debugInfo.timestamp && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Window Location:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(debugInfo.windowLocation, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Wouter Location:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    Location: {debugInfo.wouterLocation}
                    Search: {debugInfo.wouterSearch || '(empty)'}
                    Full Search: {debugInfo.wouterFullSearch || '(empty)'}
                  </pre>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Parse from window.location.search:</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(debugInfo.parseResultFromWindow, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Parse from wouter location:</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(debugInfo.parseResultFromWouter, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Comparison:</h4>
                  <div className="flex gap-2">
                    <Badge variant={
                      JSON.stringify(debugInfo.parseResultFromWindow) === JSON.stringify(debugInfo.parseResultFromWouter) 
                        ? "default" : "destructive"
                    }>
                      Results {JSON.stringify(debugInfo.parseResultFromWindow) === JSON.stringify(debugInfo.parseResultFromWouter) ? "Match" : "Differ"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Input: {result.input || '(none)'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.timestamp}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Go back to main dashboard */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              data-testid="button-back-to-dashboard"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}