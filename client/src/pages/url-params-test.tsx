import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseUrlParams, buildUrlParams, DEFAULT_FILTER_STATE, FilterState } from "@/lib/utils";

interface TestResult {
  name: string;
  url: string;
  expected: any;
  actual: any;
  passed: boolean;
}

export default function UrlParamsTest() {
  const [customUrl, setCustomUrl] = useState("?region=NCR&status=Ongoing&office=DPWH-CO&tab=table");
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Predefined test cases
  const testCases = [
    {
      name: "Empty URL",
      url: "",
      expected: {
        filters: DEFAULT_FILTER_STATE,
        activeTab: "analytics"
      }
    },
    {
      name: "Basic filters",
      url: "?region=NCR&status=Ongoing",
      expected: {
        filters: {
          ...DEFAULT_FILTER_STATE,
          region: "NCR",
          status: "Ongoing"
        },
        activeTab: "analytics"
      }
    },
    {
      name: "All filters with tab",
      url: "?search=highway&region=NCR&office=DPWH-CO&contractor=ABC%20Corp&status=Ongoing&year=2024&province=Metro%20Manila&municipality=Manila&barangay=Ermita&tab=table",
      expected: {
        filters: {
          search: "highway",
          region: "NCR",
          implementingOffice: "DPWH-CO",
          contractor: "ABC Corp",
          status: "Ongoing",
          year: "2024",
          province: "Metro Manila",
          municipality: "Manila",
          barangay: "Ermita"
        },
        activeTab: "table"
      }
    },
    {
      name: "Legacy implementingOffice parameter",
      url: "?implementingOffice=DPWH-Legacy&region=Region%20IV-A",
      expected: {
        filters: {
          ...DEFAULT_FILTER_STATE,
          implementingOffice: "DPWH-Legacy",
          region: "Region IV-A"
        },
        activeTab: "analytics"
      }
    },
    {
      name: "Both office and implementingOffice (office should take precedence)",
      url: "?office=DPWH-Current&implementingOffice=DPWH-Legacy",
      expected: {
        filters: {
          ...DEFAULT_FILTER_STATE,
          implementingOffice: "DPWH-Current"
        },
        activeTab: "analytics"
      }
    },
    {
      name: "URL encoded special characters",
      url: "?search=Project%20%26%20Development&contractor=Smith%20%26%20Co.&tab=admin",
      expected: {
        filters: {
          ...DEFAULT_FILTER_STATE,
          search: "Project & Development",
          contractor: "Smith & Co."
        },
        activeTab: "admin"
      }
    },
    {
      name: "Empty string values (should use defaults)",
      url: "?search=&region=&office=",
      expected: {
        filters: DEFAULT_FILTER_STATE,
        activeTab: "analytics"
      }
    },
    {
      name: "Only search parameter",
      url: "?search=road%20construction",
      expected: {
        filters: {
          ...DEFAULT_FILTER_STATE,
          search: "road construction"
        },
        activeTab: "analytics"
      }
    },
    {
      name: "Tab parameter only",
      url: "?tab=table",
      expected: {
        filters: DEFAULT_FILTER_STATE,
        activeTab: "table"
      }
    }
  ];

  const runSingleTest = (testCase: any): TestResult => {
    try {
      const actual = parseUrlParams(testCase.url);
      const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
      
      return {
        name: testCase.name,
        url: testCase.url,
        expected: testCase.expected,
        actual,
        passed
      };
    } catch (error) {
      return {
        name: testCase.name,
        url: testCase.url,
        expected: testCase.expected,
        actual: { error: error.message },
        passed: false
      };
    }
  };

  const runAllTests = () => {
    const results = testCases.map(runSingleTest);
    setTestResults(results);
  };

  const testCustomUrl = () => {
    const customTestCase = {
      name: "Custom URL Test",
      url: customUrl,
      expected: "Manual verification needed"
    };
    
    const result = runSingleTest({ ...customTestCase, expected: {} });
    setTestResults([result]);
  };

  const testRoundTrip = () => {
    // Test building URL from filters and then parsing it back
    const originalFilters: FilterState = {
      search: "test search",
      region: "NCR",
      implementingOffice: "DPWH-CO",
      contractor: "Test Corp",
      status: "Ongoing",
      year: "2024",
      province: "Metro Manila",
      municipality: "Manila",
      barangay: "Ermita"
    };
    const originalTab = "table";
    
    try {
      // Build URL from filters
      const builtUrl = buildUrlParams(originalFilters, originalTab);
      console.log("Built URL:", builtUrl);
      
      // Parse the built URL back
      const parsed = parseUrlParams("?" + builtUrl);
      
      const roundTripPassed = JSON.stringify(parsed.filters) === JSON.stringify(originalFilters) &&
                              parsed.activeTab === originalTab;
      
      const result: TestResult = {
        name: "Round Trip Test (Build → Parse)",
        url: "?" + builtUrl,
        expected: { filters: originalFilters, activeTab: originalTab },
        actual: parsed,
        passed: roundTripPassed
      };
      
      setTestResults([result]);
    } catch (error) {
      const result: TestResult = {
        name: "Round Trip Test (Build → Parse)",
        url: "Error during test",
        expected: { filters: originalFilters, activeTab: originalTab },
        actual: { error: error.message },
        passed: false
      };
      
      setTestResults([result]);
    }
  };

  const getCurrentUrlParams = () => {
    const current = parseUrlParams(window.location.search);
    const result: TestResult = {
      name: "Current Browser URL",
      url: window.location.search || "(no parameters)",
      expected: "Current state",
      actual: current,
      passed: true
    };
    
    setTestResults([result]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">URL Parameters Test Suite</h1>
          <p className="text-muted-foreground mt-2">
            Testing parseUrlParams function for DPWH Dashboard filters
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAllTests} data-testid="button-run-all-tests">
                Run All Tests ({testCases.length})
              </Button>
              <Button onClick={testRoundTrip} variant="outline" data-testid="button-test-roundtrip">
                Test Round Trip
              </Button>
              <Button onClick={getCurrentUrlParams} variant="outline" data-testid="button-test-current-url">
                Test Current URL
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="custom-url">Custom URL Test</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="?region=NCR&status=Ongoing"
                  className="flex-1"
                  data-testid="input-custom-url"
                />
                <Button onClick={testCustomUrl} data-testid="button-test-custom-url">Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Test Results 
                <Badge variant={testResults.every(r => r.passed) ? "default" : "destructive"}>
                  {testResults.filter(r => r.passed).length}/{testResults.length} passed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <Card key={index} className={result.passed ? "border-green-200" : "border-red-200"}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? "PASS" : "FAIL"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        URL: {result.url}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Expected:</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                            {JSON.stringify(result.expected, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Actual:</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                            {JSON.stringify(result.actual, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* URL Parameter Reference */}
        <Card>
          <CardHeader>
            <CardTitle>URL Parameter Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">URL Parameter Mapping:</h4>
                <ul className="text-sm space-y-1 font-mono">
                  <li>search → search</li>
                  <li>region → region</li>
                  <li>implementingOffice → office</li>
                  <li>contractor → contractor</li>
                  <li>status → status</li>
                  <li>year → year</li>
                  <li>province → province</li>
                  <li>municipality → municipality</li>
                  <li>barangay → barangay</li>
                  <li>tab → tab</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Default Values:</h4>
                <pre className="text-xs bg-muted p-3 rounded">
                  {JSON.stringify(DEFAULT_FILTER_STATE, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}