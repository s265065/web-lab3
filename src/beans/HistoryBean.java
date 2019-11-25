package beans;

import javax.faces.context.FacesContext;
import java.io.IOException;
import java.sql.SQLException;
import java.util.*;

public class HistoryBean {

    public void setHistoryService(HistoryService historyService) {
        this.historyService = historyService;
    }

    public static class Query {

        final String x, y, r;
        final boolean result;

        public Query(String x, String y, String r, boolean result) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.result = result;
        }


        public String getX() {
            return x;
        }

        public String getY() {
            return y;
        }

        public String getR() {
            return r;
        }

        public boolean isResult() {
            return result;
        }
    }

    private HistoryService historyService = new HistoryService();

   //private final LinkedList<Query> queries = new LinkedList<>();

    private LinkedList<Query> queries = historyService.getResults();

    public void addQuery(Query query) throws SQLException{
        queries.add(query);
        historyService.addResult(query);

    }

    public List<Query> getQueries() {
        return Collections.unmodifiableList(queries);
    }

    public Collection<Query> getQueriesDescending() {
        return new AbstractCollection<Query>() {

            @Override
            public Iterator<Query> iterator() {
                return queries.descendingIterator();
            }

            @Override
            public int size() {
                return queries.size();
            }
        };
    }

}
