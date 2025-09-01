'use client';

import { TabsContent } from '@/components/ui/tabs';
import { useEffect, useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { GroceryItem, GroceryItemStatus, GroceryItemHistory } from '@/types/grocery';
import { getGroceryItemHistory } from '@/actions/grocery';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

type Props = {
  item: GroceryItem;
};

const HistoryTab = ({ item }: Props) => {
  const [history, setHistory] = useState<GroceryItemHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const fetchHistory = useCallback(async (pageNum: number, initialLoad = false) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      if (initialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      const response = await getGroceryItemHistory({ 
        itemId: item.id,
        page: pageNum,
        limit: 10
      });
      
      if (initialLoad) {
        setHistory(response.data || []);
      } else {
        setHistory(prev => [...prev, ...(response.data || [])]);
      }
      
      setHasMore((response.meta?.total || 0) > (response.meta?.page || 1) * (response.meta?.limit || 10));
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history. Please try again later.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [item.id]);

  useEffect(() => {
    if (item.id) {
      fetchHistory(1, true);
    }
  }, [item.id, fetchHistory]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchHistory(page + 1);
    }
  }, [inView, hasMore, loading, loadingMore, page, fetchHistory]);

  if (loading && history.length === 0) {
    return (
      <TabsContent value="history" className="mt-6 pb-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Activity History</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-3 w-3 rounded-full mt-1" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="history" className="mt-6 pb-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Activity History</h3>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="history" className="mt-6 pb-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Activity History</h3>
        <div className="border rounded-lg max-h-[300px] overflow-y-auto overflow-hidden">
          {history.length > 0 ? (
            <div className="divide-y">
              {history.map((historyItem, index) => (
                <div 
                  key={historyItem.id} 
                  className="p-4 hover:bg-muted/50 transition-colors"
                  ref={index === history.length - 1 ? loadMoreRef : null}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          historyItem.status === GroceryItemStatus.HAVE ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          Status changed to{' '}
                          <span
                            className={
                              historyItem.status === GroceryItemStatus.HAVE ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {historyItem.status === GroceryItemStatus.HAVE ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(historyItem.changedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {format(new Date(historyItem.changedAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loadingMore && (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!hasMore && history.length > 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No more history to show
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No history available for this item</p>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default HistoryTab;